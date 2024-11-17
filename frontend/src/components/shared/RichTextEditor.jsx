import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { useDispatch, useSelector } from "react-redux";
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
	Editor
} from "react-simple-wysiwyg";
import DOMPurify from "dompurify";
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useModal } from '../../hooks/useModal';
import { FILE_UPLOAD_CONFIG } from '../../config/constants';
import { htmlUtils } from '../../utils/htmlUtils';
import { mentionUtils } from '../../utils/mentionUtils';
import { uploadFiles } from '../../store/slices/fileSlice';
import UserMentionModal from "./UserMentionModal";

const RichTextEditor = forwardRef(({
	initialValue = "",
	onSave,
	onCancel,
	placeholder,
	saveButtonText,
	showMentions = false,
	maxLength,
	allowedFileTypes = FILE_UPLOAD_CONFIG.allowedTypes,
	maxFileSize = FILE_UPLOAD_CONFIG.maxSize,
}, ref) => {
	const appDispatch = useAppDispatch();
	const { showModal } = useModal();
	const currentUser = useSelector(state => state.auth.currentUser);
	const currentProject = useSelector(state => state.projects.currentProject);
	const users = useSelector(state => state.projects.users);

	const [content, setContent] = useState(initialValue);
	const [isMention, setIsMention] = useState(false);
	const [mentionedUsers, setMentionedUsers] = useState([]);
	const [files, setFiles] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fileInputRef = useRef(null);
	const editorRef = useRef(null);

	useImperativeHandle(ref, () => ({
		focusEditor: () => {
			if (editorRef.current) {
				editorRef.current.focus();
			}
		},
		getContent: () => content,
		clearContent: () => setContent(""),
		getFiles: () => files,
		clearFiles: () => setFiles([])
	}));

	const handleFileUpload = async (event) => {
		const newFiles = Array.from(event.target.files);

		// Validation des fichiers
		const invalidFiles = newFiles.filter(file => {
			if (!allowedFileTypes.includes(file.type)) {
				showModal('error', {
					message: `Type de fichier non supporté: ${file.type}`
				});
				return true;
			}
			if (file.size > maxFileSize) {
				showModal('error', {
					message: `Fichier trop volumineux: ${file.name}`
				});
				return true;
			}
			return false;
		});

		if (invalidFiles.length > 0) return;

		try {
			const uploadedFiles = await appDispatch(uploadFiles({
				files: newFiles,
				userId: currentUser.id,
				projectId: currentProject.id,
			})).unwrap();

			setFiles(prevFiles => [
				...prevFiles,
				...uploadedFiles.map(file => ({
					id: file.id,
					name: file.name || `File ${file.id}`,
					url: file.url,
					size: file.size,
					type: file.type
				}))
			]);
		} catch (error) {
			console.error("Error uploading files:", error);
		}
	};

	const handleKeyPress = (e) => {
		if (!showMentions) return;

		if (e.key === "@") {
			setIsMention(true);
		}

		if (maxLength && content.length >= maxLength && e.key.length === 1) {
			e.preventDefault();
		}
	};

	const handleEditorChange = (e) => {
		const newContent = e.target.value;
		if (maxLength && htmlUtils.stripHtml(newContent).length > maxLength) {
			return;
		}
		setContent(newContent);
	};

	const insertMention = (username) => {
		const mentionText = `@${username} `;
		const newContent = content + mentionText;
		setContent(newContent);
		setIsMention(false);
	};

	const handleSaveContent = async () => {
		try {
			setIsSubmitting(true);
			const sanitizedContent = DOMPurify.sanitize(content);
			const textContent = htmlUtils.stripHtml(sanitizedContent);

			if (!textContent.trim() && files.length === 0) {
				return;
			}

			// Extraire et notifier les mentions
			const mentions = mentionUtils.extractMentions(textContent);
			const mentionedUsers = users.filter(user =>
				mentions.includes(user.name)
			);

			await onSave(sanitizedContent, files, mentionedUsers);

			setContent("");
			setFiles([]);
			setMentionedUsers([]);
		} catch (error) {
			console.error("Erreur lors de la sauvegarde:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRemoveFile = (fileId) => {
		setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
	};

	return (
		<div className="rich-text-editor">
			<EditorProvider>
				<div className="editor-container">
					<Editor
						ref={editorRef}
						value={content}
						onChange={handleEditorChange}
						onKeyPress={handleKeyPress}
						placeholder={placeholder}
					>
						<Toolbar className="editor-toolbar">
							<BtnUndo title="Annuler" />
							<BtnRedo title="Rétablir" />
							<BtnBold title="Gras" />
							<BtnItalic title="Italique" />
							<BtnUnderline title="Souligné" />
							<BtnStrikeThrough title="Barré" />
							<BtnBulletList title="Liste à puces" />
							<BtnNumberedList title="Liste numérotée" />
							<BtnLink title="Lien" />
							<BtnClearFormatting title="Effacer le formatage" />
						</Toolbar>
					</Editor>
				</div>
			</EditorProvider>

			{isMention && showMentions && (
				<UserMentionModal
					users={users}
					onSelect={insertMention}
					onClose={() => setIsMention(false)}
				/>
			)}

			{maxLength && (
				<div className="editor-char-count">
					{htmlUtils.stripHtml(content).length}/{maxLength}
				</div>
			)}

			{files.length > 0 && (
				<div className="attached-files">
					<h4>Fichiers attachés:</h4>
					<ul>
						{files.map(file => (
							<li key={file.id} className="attached-file">
								<span className="file-name">{file.name}</span>
								<button
									onClick={() => handleRemoveFile(file.id)}
									className="remove-file-btn"
									aria-label="Supprimer le fichier"
								>
									Supprimer
								</button>
							</li>
						))}
					</ul>
				</div>
			)}

			<div className="editor-actions">
				<button
					className="confirm-btn"
					onClick={handleSaveContent}
					disabled={isSubmitting || (!content.trim() && files.length === 0)}
				>
					{isSubmitting ? "Enregistrement..." : saveButtonText}
				</button>

				{onCancel && (
					<button
						className="cancel-btn"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Annuler
					</button>
				)}

				<input
					type="file"
					ref={fileInputRef}
					onChange={handleFileUpload}
					multiple
					accept={allowedFileTypes.join(",")}
					style={{ display: 'none' }}
				/>

				<button
					className="add-files-btn"
					onClick={() => fileInputRef.current?.click()}
					disabled={isSubmitting}
				>
					<FontAwesomeIcon icon={faPaperclip} />
					{" Joindre des fichiers"}
				</button>
			</div>
		</div>
	);
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;