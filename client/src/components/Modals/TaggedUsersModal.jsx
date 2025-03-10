"use client";
import React from "react";
import { AuthContext } from "@/context/auth";
import styles from "@/styles/components/modals/tagged-users-modal.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useContext } from "react";

export default function TaggedUsersModal({
  project,
  filteredGuests,
  setTaggedUsers,
  mentionPosition,
  quillRef,
  setIsTaggedUsers,
  lastAtPosition,
}) {
  const { uid } = useContext(AuthContext);

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
      editor.insertEmbed(lastAtPosition, "span", mentionText + " ");

      // Mettre à jour la position du curseur après l'insertion
      setTimeout(
        () => editor.setSelection(lastAtPosition + mentionText.length + 1),
        1
      );
    }

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
          {filteredGuests?.map((guest, idx) => (
            <React.Fragment key={idx}>
              {guest._id !== uid && (
                <li key={guest?._id} onClick={() => handleTaggedUsers(guest)}>
                  <Image
                    src={guest?.picture || "/default-pfp.webp"}
                    width={25}
                    height={25}
                    alt={`Photo de profil de ${guest?.firstName}`}
                    style={{ borderRadius: "50%" }}
                  />
                  {guest?.firstName + " " + guest?.lastName}
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      ) : (
        <ul>
          {project?.guests?.map((guest, idx) => {
            return (
              <React.Fragment key={idx}>
                {guest._id !== uid && (
                  <li key={idx} onClick={() => handleTaggedUsers(guest)}>
                    <Image
                      src={guest?.picture || "/default-pfp.webp"}
                      width={25}
                      height={25}
                      alt={`Photo de profil de ${guest?.firstName}`}
                      style={{ borderRadius: "50%" }}
                    />
                    {guest?.firstName + " " + guest?.lastName}
                  </li>
                )}
              </React.Fragment>
            );
          })}
          {project?.author?._id !== uid && (
            <li onClick={() => handleTaggedUsers(project?.author)}>
              <Image
                src={project?.author?.picture || "/default-pfp.webp"}
                width={25}
                height={25}
                alt={`Photo de profil de ${project?.author?.firstName}`}
                style={{ borderRadius: "50%" }}
              />
              {project?.author?.firstName + " " + project?.author?.lastName}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
