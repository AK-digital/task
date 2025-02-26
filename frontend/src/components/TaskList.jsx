import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import TaskItem from "./TaskItem";

const TaskList = ({
	tasks,
	onEditTask,
	onDeleteTask,
	handleOpenTaskDetails,
	users,
	isDragging,
	boardId,
	currentProject,
	currentUser,
	addUserToSeenTask,
	addUserToSeenResponse,
}) => {
	return (
		<ul className={`task-list  ${isDragging ? "dragging" : ""}`}>
			{tasks.map((task, index) => (
				<Draggable
					key={task.id.toString()}
					draggableId={task.id.toString()}
					index={index}>
					{(provided) => (
						<TaskItem
							key={task.id}
							task={task}
							onEditTask={(taskId, updatedTask) =>
								onEditTask(boardId, taskId, updatedTask)
							}
							onDeleteTask={onDeleteTask}
							handleOpenTaskDetails={handleOpenTaskDetails}
							provided={provided}
							users={users}
							boardId={boardId}
							currentProject={currentProject}
							currentUser={currentUser}
							addUserToSeenTask={addUserToSeenTask}
							addUserToSeenResponse={addUserToSeenResponse}
						/>
					)}
				</Draggable>
			))}
		</ul>
	);
};
export default TaskList;
