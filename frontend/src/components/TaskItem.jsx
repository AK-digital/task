import React, { useEffect, useState } from "react";
import StatusSelect from "./shared/StatusSelect";
import PrioritySelect from "./shared/PrioritySelect";
import UserSelect from "./shared/UserSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faTrash,
	faGripVertical,
	faUpRightAndDownLeftFromCenter,
} from "@fortawesome/free-solid-svg-icons";
import TaskList from "./TaskList";

function TaskItem({
	task,
	onEditTask,
	onDeleteTask,
	provided,
	handleOpenTaskDetails,
	users,
	boardId,
	currentUser,
	addUserToSeenTask,
	addUserToSeenResponse,
	currentProject,
}) {
	const [taskText, setTaskText] = useState(task?.text);
	const [hasSeenTask, setHasSeenTask] = useState(
		task?.seenBy?.includes(currentUser?.id)
	);
	const lastResponse = task?.responses[task?.responses.length - 1];
	const [hasSeenResponse, setHasSeenResponse] = useState(
		task?.responses.length > 0
			? lastResponse?.seenBy?.includes(currentUser?.id)
			: true
	);

	useEffect(() => {
		if (!hasSeenTask) {
			addUserToSeenTask(currentProject.id, task?.id, currentUser?.id);
		}
	}, [hasSeenTask, currentProject]);

	const handleRemoveNewTaskNotif = async (e) => {
		e.preventDefault();
		await addUserToSeenTask(currentProject.id, task?.id, currentUser?.id);
		setHasSeenTask(true);
	};

	const handleRemoveNewResponseNotif = async (e) => {
		e.preventDefault();
		if (!hasSeenResponse) {
			await addUserToSeenResponse(
				currentProject.id,
				currentUser?.id,
				task?.id,
				lastResponse?.id
			);
			setHasSeenResponse(true);
		}
		handleOpenDetails();
	};

	const handleEdit = (updatedFields) => {
		if (typeof onEditTask === "function") {
			onEditTask(task.id, { ...task, ...updatedFields });
		} else {
			console.error("onEditTask is not a function");
		}
	};

	const handleTextChange = (e) => {
		setTaskText(e.target.value);
	};

	const handleTextSave = () => {
		if (taskText !== task.text) {
			handleEdit({ ...task, text: taskText });
		}
	};

	const handleTextBlur = () => {
		handleTextSave();
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault(); // Empêche le saut de ligne dans l'input
			handleTextSave();
			e.target.blur(); // Retire le focus de l'input
		}
	};

	const handleOpenDetails = () => {
		if (typeof handleOpenTaskDetails === "function") {
			handleOpenTaskDetails(task, boardId);
		} else {
			console.error("handleOpenTaskDetails is not a function");
		}
	};

	return (
		<li
			className="task-item"
			ref={provided?.innerRef}
			{...provided?.draggableProps}
			{...provided?.dragHandleProps}>
			<span className="grab-handle">
				<FontAwesomeIcon icon={faGripVertical} />
			</span>
			<input
				type="text"
				value={taskText}
				onChange={handleTextChange}
				onBlur={handleTextBlur}
				onKeyDown={handleKeyDown}
				placeholder="Tâche existante"
			/>
			<button className="edit-btn" onClick={handleRemoveNewResponseNotif}>
				Éditer
				<FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
			</button>
			<StatusSelect
				value={task.status}
				onChange={(status) => handleEdit({ ...task, status })}
				className="select select-status"
			/>
			<PrioritySelect
				value={task.priority}
				onChange={(priority) => handleEdit({ ...task, priority })}
				className="select select-priority"
			/>
			<input
				type="date"
				value={task.deadline}
				onChange={(e) => handleEdit({ ...task, deadline: e.target.value })}
			/>
			<UserSelect
				users={users}
				value={task.assignedTo}
				onChange={(assignedTo) => handleEdit({ ...task, assignedTo })}
				className="select select-user"
			/>
			{!hasSeenTask && (
				<div
					className="new-task-notification"
					onClick={handleRemoveNewTaskNotif}>
					<span>Nouvelle tâche</span>
				</div>
			)}
			{!hasSeenResponse && (
				<div
					className="new-response-notification"
					onClick={handleRemoveNewResponseNotif}>
					<span>Nouvelle réponse</span>
				</div>
			)}
			<button className="delete-btn" onClick={() => onDeleteTask(task.id)}>
				<FontAwesomeIcon icon={faTrash} />
			</button>
		</li>
	);
}

export default TaskItem;
