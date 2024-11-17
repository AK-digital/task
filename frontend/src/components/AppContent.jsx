// src/components/AppContent.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext } from "@hello-pangea/dnd";
import Header from "./Header";
import Board from "./Board";
import TaskDetails from "./TaskDetails";
import InviteUsersDialog from "./shared/InviteUsersDialog";
import DashboardStats from "./DashboardStats";
import {
	fetchProjects,
	selectCurrentProject,
	moveTask
} from '../store/slices/projectSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { selectIsLoading } from '../store/slices/uiSlice';
import LoadingSpinner from "./shared/LoadingSpinner";
import ErrorBoundary from "./shared/ErrorBoundary";
import { useAppDispatch } from '../hooks/useAppDispatch';

function AppContent() {
	const appDispatch = useAppDispatch();
	const dispatch = useDispatch();
	const currentUser = useSelector(selectCurrentUser);
	const currentProject = useSelector(selectCurrentProject);
	const isLoading = useSelector(selectIsLoading);

	useEffect(() => {
		if (currentUser) {
			appDispatch(fetchProjects(currentUser.id), {
				showLoading: true,
				errorMessage: "Erreur lors du chargement des projets"
			});
		}
	}, [currentUser, appDispatch]);

	const handleDragEnd = async (result) => {
		if (!result.destination || !currentProject) return;

		const { source, destination } = result;
		try {
			await appDispatch(moveTask({
				projectId: currentProject.id,
				sourceBoardId: source.droppableId,
				destBoardId: destination.droppableId,
				sourceIndex: source.index,
				destIndex: destination.index
			}), {
				successMessage: "Tâche déplacée avec succès",
				errorMessage: "Erreur lors du déplacement de la tâche"
			});
		} catch (error) {
			console.error('Erreur lors du déplacement:', error);
		}
	};

	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<ErrorBoundary>
			<DragDropContext onDragEnd={handleDragEnd}>
				<div className="app-content">
					<Header />

					{currentProject && <DashboardStats />}

					<main className="boards-container">
						{currentProject?.boards?.map(board => (
							<Board
								key={board.id}
								board={board}
								projectId={currentProject.id}
							/>
						))}
					</main>

					<TaskDetails />
					<InviteUsersDialog />
				</div>
			</DragDropContext>
		</ErrorBoundary>
	);
}

export default AppContent;