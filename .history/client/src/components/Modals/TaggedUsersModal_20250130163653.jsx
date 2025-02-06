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

      // Insérer la mention avec le format "span"
      const mentionText = `@${guest.firstName} ${guest.lastName}`;

      // Insérer la mention sans espace ni saut de ligne après
      editor.insertEmbed(lastAtPosition, "span", mentionText);

      // Mettre à jour la position du curseur après l'insertion
      editor.setSelection(lastAtPosition + mentionText.length, 0);
    }

    // Détection de la touche "espace"
    editor.root.addEventListener("keydown", function (event) {
      if (event.key === " " && lastAtPosition !== null) {
        const currentText = editor.getText();
        const textAfterAt = currentText.slice(lastAtPosition);
        if (textAfterAt[0] === " ") {
          // Annuler l'espace si on est déjà à l'endroit de la mention
          event.preventDefault();
          editor.insertText(lastAtPosition + 1, " ");
          editor.setSelection(lastAtPosition + 2, 0);
        }
      }
    });

    setTaggedUsers((prev) => [...prev, guest._id]);
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
