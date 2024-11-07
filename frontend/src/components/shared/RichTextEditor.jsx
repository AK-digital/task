import React, { useState, useRef, useCallback } from "react";
import "../../assets/css/task-details.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import {
	BtnBold,
	BtnItalic,
	BtnUnderline,
	BtnStrikeThrough,
	BtnBulletList,
	BtnNumberedList,
	BtnLink,
	BtnClearFormatting,
	BtnUndo,
	BtnRedo,
	Toolbar,
	EditorProvider,
	Editor,
} from "react-simple-wysiwyg";
import UserMentionModal from "./UserMentionModal";

const RichTextEditor = ({
	initialValue = "",
	onSave,
	onCancel,
	placeholder,
	saveButtonText,
	initialFiles = [],
	task,
	currentProject,
	users,
	onUploadFiles,
	handleSendDescriptionMention,
	handleSendResponseMention,
}) => {
	const [content, setContent] = useState(initialValue);
	const [isMention, setIsMention] = useState(false);
	const [mentionnedUsers, setMentionnedUsers] = useState([]);
	const [files, setFiles] = useState(
		Array.isArray(initialFiles) ? initialFiles : []
	);
	const fileInputRef = useRef(null);

	const handleSave = async () => {
		if (content && content.trim() !== "") {
			onSave(content, files);

			if (mentionnedUsers.length > 0) {
				if (handleSendDescriptionMention) {
					const taskDetails = {
						text: task?.text,
						description: content,
						priority: task?.priority,
						deadline: task?.deadline,
					};
					handleSendDescriptionMention(mentionnedUsers, taskDetails);
				} else {
					const taskDetails = {
						text: task?.text,
						description: task?.description,
						response: content,
						priority: task?.priority,
						deadline: task?.deadline,
					};
					handleSendResponseMention(mentionnedUsers, taskDetails);
				}
				setMentionnedUsers([]);
			}
		}
		setContent("");
		setFiles([]);
	};

	const handleFileUpload = useCallback(
		async (event) => {
			const newFiles = Array.from(event.target.files);
			if (newFiles.length > 0 && onUploadFiles) {
				try {
					const uploadedFiles = await onUploadFiles(newFiles);
					if (Array.isArray(uploadedFiles)) {
						setFiles((prevFiles) => [
							...prevFiles,
							...uploadedFiles.map((file) => ({
								id: file.id,
								name: file.name || `File ${file.id}`,
								url: file.url,
							})),
						]);
					} else {
						console.error(
							"La réponse de l'upload n'est pas un tableau:",
							uploadedFiles
						);
					}
				} catch (error) {
					console.error("Erreur lors de l'upload des fichiers:", error);
				}
			}
		},
		[onUploadFiles]
	);

	const removeFile = (index) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	function handleMention(e) {
		if (e.key === "@") {
			setIsMention(true);
		} else {
			setIsMention(false);
		}
	}
	return (
		<div className="rich-text-editor">
			<EditorProvider>
				<Editor
					value={content}
					onChange={(e) => setContent(e.target.value)}
					onKeyDown={handleMention}>
					<Toolbar>
						<BtnUndo /> <BtnRedo />
						<BtnBold /> <BtnItalic /> <BtnUnderline /> <BtnStrikeThrough />
						<BtnBulletList /> <BtnNumberedList />
						<BtnLink /> <BtnClearFormatting />
					</Toolbar>
				</Editor>
			</EditorProvider>
			{isMention && (
				<UserMentionModal
					project={currentProject}
					users={users}
					content={content}
					setContent={setContent}
					setIsMention={setIsMention}
					setMentionnedUsers={setMentionnedUsers}
					mentionnedUsers={mentionnedUsers}
				/>
			)}

			<input
				type="file"
				ref={fileInputRef}
				style={{ display: "none" }}
				onChange={handleFileUpload}
				multiple
			/>
			{files.length > 0 && (
				<div className="attached-files">
					<h4>Fichiers attachés:</h4>
					<ul>
						{files.map((file, index) => (
							<li className="attached-file" key={file.id || index}>
								{file.name}
								<button onClick={() => removeFile(index)}>Supprimer</button>
							</li>
						))}
					</ul>
				</div>
			)}
			<div className="editor-actions">
				<button className="confirm-btn" onClick={handleSave}>
					{saveButtonText}
				</button>
				<button className="cancel-btn" onClick={onCancel}>
					Annuler
				</button>
				<button
					className="add-files-btn"
					onClick={() => fileInputRef.current.click()}>
					<FontAwesomeIcon icon={faPaperclip} /> Joindre des fichiers
				</button>
			</div>
		</div>
	);
};

export default RichTextEditor;
