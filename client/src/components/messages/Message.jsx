"use client";

import styles from "@/styles/components/messages/message.module.css";
import { useCallback, useContext, useEffect, useState, useRef } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faPen,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { deleteMessage, updateReadBy, updateReactions } from "@/api/message";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import Tiptap from "../RichTextEditor/Tiptap";
import EmojiPicker from "emoji-picker-react";
import { Eye, SmilePlus } from "lucide-react";
import { isNotEmpty } from "@/utils/utils";

export default function Message({ task, message, project, mutateMessage }) {
  const { uid } = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [showPeopleRead, setShowPeopleRead] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  moment.locale("fr");
  const author = message?.author;
  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  const handleReadBy = useCallback(async () => {
    if (uid === author?._id) return;
    if (!message?.readBy?.includes(uid)) {
      const response = await updateReadBy(project?._id, message?._id);
      if (response.success) {
        socket.emit("update task", project?._id);
      }
    }
  }, [uid, author?._id, message?.readBy, project?._id, message?._id]);

  useEffect(() => {
    handleReadBy();
  }, [handleReadBy]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        (emojiPickerRef.current &&
          emojiPickerRef.current.contains(event.target)) ||
        (emojiButtonRef.current &&
          emojiButtonRef.current.contains(event.target)) ||
        event.target.closest(".emoji-picker-react")
      ) {
        return;
      }
      setShowEmojiPicker(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleEmojiSelect = async (emojiData) => {
    const emoji = emojiData.unified;
    try {
      const response = await updateReactions(project?._id, message?._id, emoji);
      if (response.success) {
        socket.emit("update message", project?._id);
      }
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la réaction :", error);
    }
  };

  const unifiedToEmoji = (unified) => {
    try {
      return String.fromCodePoint(
        ...unified.split("-").map((u) => parseInt("0x" + u))
      );
    } catch (e) {
      return "😊";
    }
  };

  async function handleDeleteMessage() {
    setMore(false);
    setIsLoading(true);
    const response = await deleteMessage(message?.projectId, message?._id);
    if (response?.success) {
      await mutateMessage();
      socket.emit("update message", message?.projectId);
      socket.emit("update task", project?._id);
    }
    setIsLoading(false);
  }

  return (
    <>
      {edit ? (
        <Tiptap
          project={project}
          task={task}
          type="message"
          mutateMessage={mutateMessage}
          setConvOpen={setEdit}
          editMessage={true}
          message={message}
        />
      ) : (
        <>
          <div className={styles.container} data-loading={isLoading}>
            <div className={styles.wrapper}>
              {/* Header auteur */}
              <div className={styles.header}>
                <div className={styles.user}>
                  <Image
                    src={author?.picture || "/default-pfp.webp"}
                    width={35}
                    height={35}
                    alt={`Photo de profil de ${author?.firstName}`}
                    style={{ borderRadius: "50%" }}
                  />
                  <span className={styles.names}>
                    {author?.firstName + " " + author?.lastName}
                  </span>
                  <span className={styles.date}>{formattedDate}</span>
                </div>
                <div className={styles.ellipsis}>
                  {uid === author?._id && (
                    <FontAwesomeIcon
                      icon={faEllipsisH}
                      onClick={() => setMore(true)}
                    />
                  )}
                  {more && (
                    <div className={styles.more}>
                      <ul>
                        <li
                          onClick={() => {
                            setEdit(true);
                            setMore(false);
                          }}
                        >
                          <FontAwesomeIcon icon={faPen} /> Modifier
                        </li>
                        <li onClick={handleDeleteMessage}>
                          <FontAwesomeIcon icon={faTrashAlt} /> Supprimer
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className={styles.text}>
                <div dangerouslySetInnerHTML={{ __html: message?.message }} />
              </div>
            </div>

            <div className={styles.informations}>
              {/* Lecteurs */}
              <div
                className={styles.readBy}
                onMouseEnter={() => setShowPeopleRead(true)}
                onMouseLeave={() => setShowPeopleRead(false)}
              >
                <Eye size={16} />
                <span>{message?.readBy?.length}</span>

                {showPeopleRead && isNotEmpty(message?.readBy) && (
                  <div className={styles.pictures}>
                    {message?.readBy?.slice(0, 3).map((user) => (
                      <div key={user?._id} className={styles.picture}>
                        <Image
                          src={user?.picture || "/default-pfp.webp"}
                          width={24}
                          height={24}
                          alt={`Photo de profil de ${user?.firstName}`}
                          style={{ borderRadius: "50%" }}
                        />
                      </div>
                    ))}
                    {message?.readBy?.length > 3 && (
                      <div className={styles.moreReaders}>
                        +{message?.readBy?.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Réactions */}
              {message?.reactions &&
                Object.keys(message.reactions).length > 0 && (
                  <div className={styles.emojiReactions}>
                    {Object.entries(message.reactions).map(([emoji, users]) => (
                      <div
                        key={emoji}
                        className={styles.emojiReaction}
                        onClick={async () => {
                          const response = await updateReactions(
                            project?._id,
                            message?._id,
                            emoji
                          );
                          if (response.success) {
                            socket.emit("update message", project?._id);
                          }
                        }}
                      >
                        <span className={styles.emojiIcon}>
                          {unifiedToEmoji(emoji)}
                        </span>
                        <span className={styles.emojiCount}>
                          {users.length}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

              {/* Bouton ajouter une réaction */}
              <div
                className={styles.reactions}
                ref={emojiButtonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  if (e.target.tagName === "svg") {
                    setShowEmojiPicker(!showEmojiPicker);
                  }
                }}
              >
                <SmilePlus size={16} />
                {showEmojiPicker && (
                  <div className={styles.emojiPicker} ref={emojiPickerRef}>
                    <EmojiPicker
                      reactionsDefaultOpen={true}
                      height={350}
                      width={500}
                      className={styles.reactionEmojiPicker}
                      onEmojiClick={handleEmojiSelect}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {more && (
            <div id="modal-layout-opacity" onClick={() => setMore(false)} />
          )}
        </>
      )}
    </>
  );
}
