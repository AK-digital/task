"use client";
import styles from "@/styles/components/richTextEditor/mentions-list.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useEffect, useState } from "react";
import NoPicture from "../User/NoPicture";
import { useTranslation } from "react-i18next";

export default function MentionsList({
  project,
  mentionPosition,
  editor,
  setIsTaggedUsers,
}) {
  const { t } = useTranslation();
  const members = project?.members || [];
  const [selectedIdx, setSelectedIdx] = useState(null);

  // Dans MentionsList.jsx, modifiez la fonction addMention comme suit:
  const addMention = (member) => {
    if (!editor) return;

    // Trouver la position de l'arobase
    const { state } = editor;
    const { selection } = state;
    const { from } = selection;

    // Chercher l'arobase (@) avant la position actuelle du curseur
    const textBefore = state.doc.textBetween(
      Math.max(0, from - 50), // Limiter la recherche aux 50 caractères précédents
      from
    );

    const mentionRegex = /@(\w*)$/;
    const match = textBefore.match(mentionRegex);

    if (match) {
      // Calculer la position de l'arobase
      const atSymbolPos = from - match[0].length;

      // Supprimer l'arobase et tout texte saisi après
      editor.chain().focus().deleteRange({ from: atSymbolPos, to: from }).run();

      // Insérer la mention formatée
      editor
        .chain()
        .focus()
        .insertContent({
          type: "mention",
          attrs: {
            id: member?._id,
            label: member?.firstName + " " + member?.lastName,
          },
        })
        .run();
    } else {
      // Fallback si le regex ne trouve pas l'arobase
      editor
        .chain()
        .focus()
        .insertContent({
          type: "mention",
          attrs: {
            id: member?._id,
            label: member?.firstName,
          },
        })
        .run();
    }

    setIsTaggedUsers(false); // Ferme la liste des mentions
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!setIsTaggedUsers) return;

      if (e.key === "ArrowDown") {
        setSelectedIdx((prevIdx) => {
          if (prevIdx === null) {
            return 0;
          } else {
            return prevIdx === members.length - 1 ? 0 : prevIdx + 1;
          }
        });
      } else if (e.key === "ArrowUp") {
        setSelectedIdx((prevIdx) => {
          if (prevIdx === null) {
            return members.length - 1;
          } else {
            return prevIdx === 0 ? members.length - 1 : prevIdx - 1;
          }
        });
      }
      if (e.key === "Enter" && selectedIdx !== null) {
        e.preventDefault();
        addMention(members[selectedIdx]?.user);
      } else if (e.key === "Escape") {
        setIsTaggedUsers(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [members.length, selectedIdx]); // Ajout de guests.length pour éviter les erreurs

  const resetIdxOnMouseEnter = (e) => {
    e.preventDefault();

    setSelectedIdx(null);
  };

  return (
    <div
      className={styles.container}
      style={{
        top: mentionPosition?.top,
        left: mentionPosition?.left,
      }}
      onMouseEnter={resetIdxOnMouseEnter}
    >
      {isNotEmpty(members) && (
        <div className={styles.guests}>
          <ul className={styles.items}>
            {members?.map((member, idx) => {
              return (
                <li
                  className={styles.item}
                  key={member?.user?._id}
                  data-active={idx === selectedIdx}
                  onClick={() => addMention(member?.user)}
                >
                  {member?.user?.picture ? (
                    <Image
                      src={member?.user?.picture || "/default-pfp.webp"}
                      width={22}
                      height={22}
                      alt={`${t("general.profile_picture_alt")} ${
                        member?.user?.firstName
                      }`}
                      style={{ borderRadius: "50%" }}
                    />
                  ) : (
                    <NoPicture user={member?.user} width={22} height={22} />
                  )}
                  {member?.user?.firstName + " " + member?.user?.lastName}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
