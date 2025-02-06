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

    if (lastAtPosition !== null) {
      const currentText = editor.getText();
      const textAfterAt = currentText.slice(lastAtPosition);
      const nextSpaceIndex = textAfterAt.indexOf(" ");
      const deleteLength =
        nextSpaceIndex > -1 ? nextSpaceIndex : textAfterAt.length;

      // Supprimer l'ancien texte après "@"
      editor.deleteText(lastAtPosition, deleteLength);

      // Insérer un span pour styliser le nom mentionné
      const fullName = `@${guest.firstName} ${guest.lastName}`;
      const mentionSpan = `<span className=${styles.mention}>${fullName}</span>`;

      editor.clipboard.dangerouslyPasteHTML(lastAtPosition, mentionSpan);

      // Mettre à jour la position du curseur après l'insertion
      editor.setSelection(lastAtPosition + fullName.length, 0);

      // Focus sur l'éditeur
      editor.focus();
    }

    // Ajouter l'ID aux utilisateurs mentionnés
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
