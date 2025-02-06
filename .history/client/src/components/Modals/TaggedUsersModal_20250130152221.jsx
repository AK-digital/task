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
      // Calculer la position actuelle pour savoir combien de caractères supprimer
      const currentText = editor.getText();
      const textAfterAt = currentText.slice(lastAtPosition);
      const nextSpaceIndex = textAfterAt.indexOf(" ");
      const deleteLength =
        nextSpaceIndex > -1 ? nextSpaceIndex : textAfterAt.length;

      // Supprimer le texte de recherche
      editor.deleteText(lastAtPosition, deleteLength);

      // Insérer le @ comme texte normal
      editor.insertText(lastAtPosition, "@");

      // Insérer le nom complet dans un span
      const fullName = `${guest.firstName} ${guest.lastName}`;
      editor.insertEmbed(
        lastAtPosition + 1,
        "span",
        `<span class="mention" data-user-id="${guest._id}">${fullName}</span>`
      );

      // Ajouter un espace après la mention
      editor.insertText(lastAtPosition + fullName.length + 1, " ");

      // Mettre à jour la position du curseur après l'espace
      editor.setSelection(lastAtPosition + fullName.length + 2, 0);

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
