import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";

export default function TaggedUsersModal({
  project,
  filteredGuests,
  setTaggedUsers,
  mentionPosition,
  quillRef,
  setIsTaggedUsers,
  lastAtPosition,
}) {
  function handleTaggedUsers(guest) {
    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();
    const cursorPosition = selection ? selection.index : 0;

    // Supprimer le @ et le texte qui suit
    if (lastAtPosition !== null) {
      const currentText = editor.getText();
      const textAfterAt = currentText.slice(lastAtPosition);
      const nextSpaceIndex = textAfterAt.indexOf(" ");
      const deleteLength =
        nextSpaceIndex > -1 ? nextSpaceIndex : textAfterAt.length;
      editor.deleteText(lastAtPosition, deleteLength);
    }

    // Créer le texte de la mention
    const mentionText = `${guest.firstName} ${guest.lastName}`;

    // Insérer la mention avec le format personnalisé
    editor.insertEmbed(lastAtPosition, "mention", mentionText);
    editor.insertText(lastAtPosition + 1, " ");
    editor.setSelection(lastAtPosition + 2, 0);

    // Focus sur l'éditeur
    editor.focus();

    // Mettre à jour la liste des utilisateurs tagués
    setTaggedUsers((prev) => [...prev, guest._id]);

    // Fermer le modal
    setIsTaggedUsers(false);
  }

  return (
    <div
      className={styles.container}
      style={{
        top: `${mentionPosition.top}px`,
        left: `${mentionPosition.left}px`,
      }}
    >
      <div>
        <span>Personnes à mentionner</span>
      </div>

      {isNotEmpty(filteredGuests) ? (
        <ul>
          {filteredGuests?.map((guest) => (
            <li key={guest?._id} onClick={() => handleTaggedUsers(guest)}>
              <Image
                src={guest?.picture}
                width={25}
                height={25}
                alt={`Photo de profil de ${guest?.firstName}`}
                style={{ borderRadius: "50%" }}
              />
              {guest?.firstName + " " + guest?.lastName}
            </li>
          ))}
        </ul>
      ) : (
        <ul>
          {project?.guests?.map((guest) => (
            <li key={guest?._id} onClick={() => handleTaggedUsers(guest)}>
              <Image
                src={guest?.picture}
                width={25}
                height={25}
                alt={`Photo de profil de ${guest?.firstName}`}
                style={{ borderRadius: "50%" }}
              />
              {guest?.firstName + " " + guest?.lastName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
