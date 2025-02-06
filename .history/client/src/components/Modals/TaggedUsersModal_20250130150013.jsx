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
}) {
  function handleTaggedUsers(guest) {
    // Ajouter l'ID à la liste des utilisateurs taggés
    setTaggedUsers((prev) => [...prev, guest._id]);

    // Récupérer l'éditeur Quill
    const editor = quillRef.current.getEditor();
    const selection = editor.getSelection();

    if (selection) {
      // On trouve la position du dernier @
      const text = editor.getText(0, selection.index);
      const lastAtPos = text.lastIndexOf("@");

      // On supprime tout depuis le @ jusqu'à la position actuelle
      if (lastAtPos !== -1) {
        editor.deleteText(lastAtPos, selection.index - lastAtPos);

        // On insère le nouveau texte à la position du @
        const mentionText = `@${guest.firstName} ${guest.lastName} `;
        editor.insertText(lastAtPos, mentionText);

        // On place le curseur après la mention
        editor.setSelection(lastAtPos + mentionText.length);
      }
    }

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
          {filteredGuests?.map((guest) => {
            return (
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
            );
          })}
        </ul>
      ) : (
        <ul>
          {project?.guests?.map((guest) => {
            return (
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
            );
          })}
        </ul>
      )}
    </div>
  );
}
