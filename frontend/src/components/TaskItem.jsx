import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faGripVertical, faUpRightAndDownLeftFromCenter } from "@fortawesome/free-solid-svg-icons";
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useModal } from '../hooks/useModal';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../config/constants';
import { dateUtils } from '../utils/dateUtils';
import { validators } from '../utils/validators';
import StatusSelect from "./shared/StatusSelect";
import PrioritySelect from "./shared/PrioritySelect";
import UserSelect from "./shared/UserSelect";
import {
    updateTask,
    deleteTask,
    setCurrentTask
} from '../store/slices/taskSlice';
import { selectCurrentUser } from '../store/slices/authSlice';

function TaskItem({ task, boardId, provided, projectId }) {
    const appDispatch = useAppDispatch();
    const dispatch = useDispatch();
    const { showConfirmation } = useModal();
    const currentUser = useSelector(selectCurrentUser);
    const users = useSelector(state => state.projects.users);

    const [taskText, setTaskText] = useState(task?.text || '');
    const [hasSeenTask, setHasSeenTask] = useState(
        task?.seenBy?.includes(currentUser?.id) || false
    );
    const [hasSeenResponse, setHasSeenResponse] = useState(
        !task?.responses?.length ||
        task?.responses[task.responses.length - 1]?.seenBy?.includes(currentUser?.id) ||
        false
    );

    useEffect(() => {
        if (task?.text) {
            setTaskText(task.text);
        }
    }, [task?.text]);

    useEffect(() => {
        if (!hasSeenTask && task?.id) {
            handleRemoveNewTaskNotif({ stopPropagation: () => { } });
        }
    }, []);

    const handleEdit = async (updatedFields) => {
        await appDispatch(
            updateTask({
                projectId,
                boardId,
                taskId: task.id,
                updates: updatedFields
            }),
            {
                successMessage: "Tâche mise à jour avec succès",
                errorMessage: "Erreur lors de la mise à jour de la tâche"
            }
        );
    };

    const handleTextChange = (e) => {
        setTaskText(e.target.value);
    };

    const handleTextBlur = async () => {
        if (taskText === task.text) return;
        if (!validators.isValidTaskTitle(taskText)) {
            setTaskText(task.text);
            return;
        }
        await handleEdit({ text: taskText });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleTextBlur();
            e.target.blur();
        }
    };

    const handleRemoveNewTaskNotif = async (e) => {
        e.stopPropagation();
        try {
            await appDispatch(
                updateTask({
                    projectId,
                    boardId,
                    taskId: task.id,
                    updates: {
                        seenBy: [...(task.seenBy || []), currentUser.id]
                    }
                }),
                { showLoading: false }
            );
            setHasSeenTask(true);
        } catch (error) {
            console.error("Erreur lors du marquage de la tâche comme vue:", error);
        }
    };

    const handleRemoveNewResponseNotif = async (e) => {
        e.stopPropagation();
        if (!task.responses?.length) return;

        try {
            const lastResponse = task.responses[task.responses.length - 1];
            await appDispatch(
                updateTask({
                    projectId,
                    boardId,
                    taskId: task.id,
                    updates: {
                        responses: task.responses.map((response, index) => {
                            if (index === task.responses.length - 1) {
                                return {
                                    ...response,
                                    seenBy: [...(response.seenBy || []), currentUser.id]
                                };
                            }
                            return response;
                        })
                    }
                }),
                { showLoading: false }
            );
            setHasSeenResponse(true);
            dispatch(setCurrentTask({ ...task, boardId }));
        } catch (error) {
            console.error("Erreur lors du marquage de la réponse comme vue:", error);
        }
    };

    const handleDeleteTask = () => {
        showConfirmation(
            "Êtes-vous sûr de vouloir supprimer cette tâche ?",
            async () => {
                await appDispatch(
                    deleteTask({
                        projectId,
                        boardId,
                        taskId: task.id
                    }),
                    {
                        successMessage: "Tâche supprimée avec succès",
                        errorMessage: "Erreur lors de la suppression de la tâche"
                    }
                );
            }
        );
    };

    const isOverdue = task.deadline && dateUtils.isOverdue(task.deadline);

    return (
        <li
            ref={provided?.innerRef}
            {...provided?.draggableProps}
            {...provided?.dragHandleProps}
            className={`task-item ${isOverdue ? 'overdue' : ''}`}
        >
            <span className="grab-handle">
                <FontAwesomeIcon icon={faGripVertical} />
            </span>

            <input
                type="text"
                value={taskText}
                onChange={handleTextChange}
                onBlur={handleTextBlur}
                onKeyDown={handleKeyDown}
                placeholder="Entrer une tâche..."
                onClick={(e) => e.stopPropagation()}
            />

            <button
                className="edit-btn"
                onClick={() => dispatch(setCurrentTask({ ...task, boardId }))}
            >
                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
            </button>

            <StatusSelect
                value={task.status}
                onChange={(status) => handleEdit({ status })}
                className="select select-status"
            />

            <PrioritySelect
                value={task.priority}
                onChange={(priority) => handleEdit({ priority })}
                className="select select-priority"
            />

            <input
                type="date"
                value={task.deadline || ""}
                onChange={(e) => handleEdit({ deadline: e.target.value })}
                onClick={(e) => e.stopPropagation()}
            />

            <UserSelect
                users={users}
                value={task.assignedTo}
                onChange={(assignedTo) => handleEdit({ assignedTo })}
                className="select select-user"
            />

            {!hasSeenTask && (
                <div
                    className="new-task-notification"
                    onClick={handleRemoveNewTaskNotif}
                >
                    <span>Nouvelle tâche</span>
                </div>
            )}

            {!hasSeenResponse && task?.responses?.length > 0 && (
                <div
                    className="new-response-notification"
                    onClick={handleRemoveNewResponseNotif}
                >
                    <span>Nouvelle réponse</span>
                </div>
            )}

            <button
                className="delete-btn"
                onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask();
                }}
            >
                <FontAwesomeIcon icon={faTrash} />
            </button>
        </li>
    );
}

export default TaskItem;