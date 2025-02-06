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
      // Supprimer le @ et le texte de recherche
      const currentPosition = selection.index;
      const textBeforeCaret = editor.getText(0, currentPosition);
      const lastAtSymbol = textBeforeCaret.lastIndexOf("@");

      editor.deleteText(lastAtSymbol, currentPosition - lastAtSymbol);

      // Insérer le nom formatté avec le @
      const mentionText = `@${guest.firstName} ${guest.lastName} `;
      const mentionHTML = `<span class="mention" data-user-id="${guest._id}">${mentionText}</span>`;

      editor.clipboard.dangerouslyPasteHTML(lastAtSymbol, mentionHTML);

      // Déplacer le curseur après la mention
      editor.setSelection(lastAtSymbol + mentionText.length);
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
