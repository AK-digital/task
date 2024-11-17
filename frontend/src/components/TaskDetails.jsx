import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import DOMPurify from "dompurify";
import RichTextEditor from "./shared/RichTextEditor";
import { useAppDispatch } from '../hooks/useAppDispatch';
import { dateUtils } from '../utils/dateUtils';
import { formatters } from '../utils/formatters';
import {
	updateTask,
	setCurrentTask,
	clearCurrentTask,
	addTaskResponse,
	deleteTaskResponse
} from '../store/slices/taskSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { selectCurrentProject } from '../store/slices/projectSlice';
import { tasksApi } from '../services/api/tasks';

function TaskDetails() {
	const appDispatch = useAppDispatch();
	const dispatch = useDispatch();
	const task = useSelector(state => state.tasks.currentTask);
	const currentUser = useSelector(selectCurrentUser);
	const currentProject = useSelector(selectCurrentProject);
	const users = useSelector(state => state.projects.users);

	const [isEditingDescription, setIsEditingDescription] = useState(false);

	const handleClose = () => {
		dispatch(clearCurrentTask());
	};

	const handleSaveDescription = async (description, files) => {
		try {
			if (!currentProject || !task) return;

			const sanitizedDescription = DOMPurify.sanitize(description);

			await appDispatch(
				updateTask({
					projectId: currentProject.id,
					boardId: task.boardId,
					taskId: task.id,
					updates: {
						description: sanitizedDescription,
						files: files || [],
						lastUpdatedBy: currentUser.id,
						lastUpdatedAt: new Date().toISOString()
					}
				}),
				{
					successMessage: "Description mise à jour avec succès",
					errorMessage: "Erreur lors de la mise à jour de la description"
				}
			);

			// Notifier les utilisateurs mentionnés
			const mentionedUsers = extractMentionedUsers(sanitizedDescription);
			if (mentionedUsers.length > 0) {
				await tasksApi.notifyMention(mentionedUsers, {
					...task,
					description: sanitizedDescription
				}, 'description');
			}

			setIsEditingDescription(false);
		} catch (error) {
			console.error("Erreur lors de la sauvegarde de la description:", error);
		}
	};

	const handleAddResponse = async (responseText, files) => {
		if (!responseText?.trim() || !currentUser || !task) return;

		try {
			const textContent = typeof responseText === 'object' ?
				responseText.value || responseText.text : responseText;

			const sanitizedHtml = DOMPurify.sanitize(textContent);

			await appDispatch(
				addTaskResponse({
					projectId: currentProject.id,
					boardId: task.boardId,
					taskId: task.id,
					response: {
						id: Date.now(),
						text: sanitizedHtml,
						date: new Date().toISOString(),
						author_id: currentUser.id,
						files,
						seenBy: [currentUser.id]
					}
				}),
				{
					successMessage: "Réponse ajoutée avec succès",
					errorMessage: "Erreur lors de l'ajout de la réponse"
				}
			);

			// Notifier les utilisateurs mentionnés
			const mentionedUsers = extractMentionedUsers(sanitizedHtml);
			if (mentionedUsers.length > 0) {
				await tasksApi.notifyMention(mentionedUsers, {
					...task,
					response: sanitizedHtml
				}, 'response');
			}
		} catch (error) {
			console.error("Erreur réponse:", error);
		}
	};

	const extractMentionedUsers = (content) => {
		const mentionRegex = /@(\w+)/g;
		const matches = content.match(mentionRegex) || [];
		return matches
			.map(match => match.substring(1))
			.map(username => users.find(u => u.name === username))
			.filter(user => user);
	};

	const getAuthorImage = useCallback((profilePicture) => {
		if (!profilePicture) return "/assets/img/default-profile-pic.svg";
		return profilePicture.startsWith('http') ? profilePicture : `/assets/img/${profilePicture}`;
	}, []);

	if (!task) return null;

	const taskAuthor = users.find(u => u.id === task.createdBy) || {
		name: "Utilisateur inconnu",
		profilePicture: "default-profile-pic.svg"
	};

	return (
		<div className={`task-details ${task ? "open" : ""}`}>
			<button className="close-slider" onClick={handleClose}>×</button>

			<div className="task-title">{task.text}</div>

			<section className="task-description">
				<h3>Description</h3>
				<div className="task-description-header">
					<img
						src={getAuthorImage(taskAuthor.profilePicture)}
						alt={taskAuthor.name}
						className="author-avatar"
					/>
					<span>{taskAuthor.name}</span>
					<span className="creation-date">
						{dateUtils.formatDate(task.createdAt)}
					</span>
				</div>

				{isEditingDescription ? (
					<RichTextEditor
						initialValue={task.description || ""}
						onSave={handleSaveDescription}
						onCancel={() => setIsEditingDescription(false)}
						placeholder="Ajouter une description..."
						saveButtonText="Enregistrer la description"
					/>
				) : (
					<div
						className="task-description-content"
						onClick={() => setIsEditingDescription(true)}
						dangerouslySetInnerHTML={{
							__html: task.description || "Ajouter une description..."
						}}
					/>
				)}
			</section>

			<section className="task-responses">
				<h3>Conversation</h3>
				{task.responses?.map((response, index) => {
					const author = users.find(u => u.id === response.author_id) || {
						name: "Utilisateur inconnu",
						profilePicture: "default-profile-pic.svg"
					};

					return (
						<div key={response.id || index} className="response-item">
							<div className="response-header">
								<img
									src={getAuthorImage(author.profilePicture)}
									alt={author.name}
									className="author-avatar"
								/>
								<div className="response-meta">
									<span className="author-name">{author.name}</span>
									<span className="response-date">
										{dateUtils.formatRelative(response.date)}
									</span>
								</div>
							</div>
							<div
								className="response-content"
								dangerouslySetInnerHTML={{
									__html: formatters.truncateHtml(response.text)
								}}
							/>
							{response.files?.length > 0 && (
								<div className="response-files">
									{response.files.map(file => (
										<a
											key={file.id}
											href={file.url}
											target="_blank"
											rel="noopener noreferrer"
											className="file-link"
										>
											{file.name} ({formatters.formatFileSize(file.size)})
										</a>
									))}
								</div>
							)}
						</div>
					);
				})}

				<div className="add-response">
					<RichTextEditor
						initialValue=""
						onSave={handleAddResponse}
						onCancel={() => { }}
						placeholder="Ajouter un commentaire..."
						saveButtonText="Envoyer"
						task={task}
						currentProject={currentProject}
						users={users}
						showMentions={true}
					/>
				</div>
			</section>

			<div className="task-metadata">
				<div className="metadata-item">
					<label>Créé par</label>
					<span>{taskAuthor.name}</span>
				</div>
				<div className="metadata-item">
					<label>Créé le</label>
					<span>{dateUtils.formatDate(task.createdAt)}</span>
				</div>
				{task.lastUpdatedBy && (
					<>
						<div className="metadata-item">
							<label>Dernière modification par</label>
							<span>
								{users.find(u => u.id === task.lastUpdatedBy)?.name || "Inconnu"}
							</span>
						</div>
						<div className="metadata-item">
							<label>Modifié le</label>
							<span>{dateUtils.formatDate(task.lastUpdatedAt)}</span>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default TaskDetails;