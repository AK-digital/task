import React from "react";
import { useSelector } from "react-redux";
import { Draggable } from "@hello-pangea/dnd";
import TaskItem from "./TaskItem";
import { selectCurrentProject } from '../store/slices/projectSlice';
import { selectFilteredTasks } from '../store/selectors/taskSelectors';

const TaskList = ({ boardId }) => {
	const currentProject = useSelector(selectCurrentProject);
	const filteredTasks = useSelector(selectFilteredTasks);

	// Filtrer les tâches pour ce tableau spécifique
	const boardTasks = filteredTasks.filter(task => task.boardId === boardId);

	return (
		<ul className="task-list">
			{boardTasks.map((task, index) => (
				<Draggable
					key={task.id.toString()}
					draggableId={task.id.toString()}
					index={index}
				>
					{(provided) => (
						<TaskItem
							task={task}
							boardId={boardId}
							provided={provided}
							projectId={currentProject.id}
						/>
					)}
				</Draggable>
			))}
		</ul>
	);
};

export default TaskList;