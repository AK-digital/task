import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Droppable } from "@hello-pangea/dnd";
import TaskList from "./TaskList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { STATUS_OPTIONS } from "../config/constants";
import { useModal } from "../hooks/useModal";
import { useAppDispatch } from "../hooks/useAppDispatch";
import {
	updateBoard,
	deleteBoard,
	addTask,
	selectCurrentProject
} from '../store/slices/projectSlice';
import { selectCurrentUser } from '../store/slices/authSlice';

function Board({ board }) {
	const appDispatch = useAppDispatch();
	const dispatch = useDispatch();
	const { showConfirmation } = useModal();
	const currentUser = useSelector(selectCurrentUser);
	const currentProject = useSelector(selectCurrentProject);

	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [newTitle, setNewTitle] = useState(board.title);
	const [titleColor, setTitleColor] = useState(board.titleColor || "#ffffff");
	const [showColorPicker, setShowColorPicker] = useState(false);
	const [newTask, setNewTask] = useState({
		text: "",
		status: STATUS_OPTIONS[0].value,
		priority: "medium",
		deadline: "",
		assignedTo: ""
	});

	const colors = [
		"#ffffff",
		"#bb928f",
		"#c19e34",
		"#dfd66e",
		"#70e578",
		"#a7ffeb",
		"#aecbfa",
		"#d7aefb",
		"#fdcfe8",
		"#e08a9f"
	];

	const handleTitleSubmit = async () => {
		if (newTitle.trim() === board.title) {
			setIsEditingTitle(false);
			return;
		}

		await appDispatch(
			updateBoard({
				projectId: currentProject.id,
				boardId: board.id,
				updateData: { title: newTitle.trim() }
			}),
			{
				successMessage: "Titre du tableau mis à jour",
				errorMessage: "Erreur lors de la mise à jour du titre"
			}
		);
		setIsEditingTitle(false);
	};

	const handleNewTaskChange = (field, value) => {
		setNewTask(prev => ({ ...prev, [field]: value }));
	};

	const handleAddNewTask = async () => {
		if (newTask.text.trim() === "") return;

		try {
			await appDispatch(
				addTask({
					projectId: currentProject.id,
					boardId: board.id,
					taskData: {
						...newTask,
						text: newTask.text.trim(),
						description: "",
						responses: [],
						seenBy: [currentUser.id],
						createdBy: currentUser.id,
						createdAt: new Date().toISOString()
					}
				}),
				{
					successMessage: "Tâche ajoutée avec succès",
					errorMessage: "Erreur lors de l'ajout de la tâche"
				}
			);

			setNewTask({
				text: "",
				status: STATUS_OPTIONS[0].value,
				priority: "medium",
				deadline: "",
				assignedTo: ""
			});
		} catch (error) {
			console.error("Erreur lors de l'ajout de la tâche:", error);
		}
	};

	const handleDeleteBoard = () => {
		showConfirmation(
			`Êtes-vous sûr de vouloir supprimer le tableau "${board.title}" ? Toutes les tâches seront également supprimées.`,
			async () => {
				await appDispatch(
					deleteBoard({
						projectId: currentProject.id,
						boardId: board.id
					}),
					{
						successMessage: "Tableau supprimé avec succès",
						errorMessage: "Erreur lors de la suppression du tableau"
					}
				);
			}
		);
	};

	const handleColorChange = async (color) => {
		setTitleColor(color);
		await appDispatch(
			updateBoard({
				projectId: currentProject.id,
				boardId: board.id,
				updateData: { titleColor: color }
			}),
			{
				successMessage: "Couleur mise à jour",
				errorMessage: "Erreur lors de la mise à jour de la couleur"
			}
		);
		setShowColorPicker(false);
	};

	return (
		<Droppable droppableId={board.id.toString()}>
			{(provided) => (
				<div
					className="board"
					ref={provided.innerRef}
					{...provided.droppableProps}
					style={{
						borderLeft: titleColor ? `2px solid ${titleColor}` : "none"
					}}
				>
					<div className="board-header">
						<div className="board-title-wrapper">
							{isEditingTitle ? (
								<input
									type="text"
									value={newTitle}
									onChange={(e) => setNewTitle(e.target.value)}
									onBlur={handleTitleSubmit}
									onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
									autoFocus
								/>
							) : (
								<h3 className="board-title" onClick={() => setIsEditingTitle(true)}>
									<span style={{ color: titleColor }}>{board.title}</span>
								</h3>
							)}
							<div
								className="color-picker-container"
								onMouseEnter={() => setShowColorPicker(true)}
								onMouseLeave={() => setShowColorPicker(false)}
							>
								<span
									className="color-circle"
									style={{ backgroundColor: titleColor }}
								/>
								{showColorPicker && (
									<div className="color-picker">
										{colors.map((color, index) => (
											<div
												key={index}
												className="color-option"
												style={{ backgroundColor: color }}
												onClick={() => handleColorChange(color)}
											/>
										))}
									</div>
								)}
							</div>
						</div>
						<div className="delete-icon-wrapper">
							<button onClick={handleDeleteBoard} className="delete-btn">
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
					</div>

					<TaskList tasks={board.tasks} boardId={board.id} />
					{provided.placeholder}

					<div className="add-task-form">
						<span className="plus-icon">+</span>
						<input
							type="text"
							value={newTask.text}
							onChange={(e) => handleNewTaskChange("text", e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleAddNewTask()}
							placeholder="Nouvelle tâche"
						/>
						{newTask.text.trim() !== "" && (
							<button onClick={handleAddNewTask}>Ajouter</button>
						)}
					</div>
				</div>
			)}
		</Droppable>
	);
}

export default Board;