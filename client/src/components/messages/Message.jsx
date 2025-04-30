"use client";

import styles from "@/styles/components/messages/message.module.css";
import { useCallback, useContext, useEffect, useState } from "react";
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
import { groupReactionsByEmoji, isNotEmpty } from "@/utils/utils";
import UsersInfo from "../Popups/UsersInfo";
import { useUserRole } from "@/app/hooks/useUserRole";

export default function Message({ task, message, project, mutateMessage }) {
  const { user, uid } = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [showPeopleRead, setShowPeopleRead] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState(null);

  const canReact = useUserRole(project, [
    "owner",
    "manager",
    "member",
    "customer",
  ]);

  moment.locale("fr");
  const author = message?.author;
  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");
  const hasUserReacted = message?.reactions?.some(
    (reaction) => reaction.userId === uid
  );

  const uniqueReactions = groupReactionsByEmoji(message?.reactions);

  const usersWhoReacted = message?.reactions?.map(
    (reaction) => reaction?.userId
  );

  const handleReadBy = useCallback(async () => {
    if (uid === author?._id) return;
    if (!message?.readBy?.includes(uid)) {
      const response = await updateReadBy(project?._id, message?._id);

      if (!response?.success) return;

      socket.emit("update task", project?._id);
    }
  }, [uid, author?._id, message?.readBy, project?._id, message?._id]);

  useEffect(() => {
    handleReadBy();
  }, [handleReadBy]);

  async function handleReactionClick(emoji) {
    setShowEmojiPicker(false);

    const response = await updateReactions(project?._id, message?._id, emoji);

    if (!response.success) return;

    socket.emit("update message", project?._id);

    if (response?.message?.includes("ajoutée")) {
      const messageBody = {
        title: `${user?.firstName} a réagi à votre message`,
        content: `${user?.firstName} a réagi à votre message avec ${emoji}`,
      };

      const link = "/projects/" + project?._id + "/task/" + task?._id;

      socket.emit(
        "create notification",
        user,
        [author?._id],
        messageBody,
        link
      );
    }

    await mutateMessage();
  }

  const handleReactionsButtonClick = (e) => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  async function handleDeleteMessage() {
    setMore(false);
    setIsLoading(true);
    const response = await deleteMessage(message?.projectId, message?._id);

    if (!response?.success) return;

    await mutateMessage();
    socket.emit("update message", message?.projectId);
    socket.emit("update task", project?._id);

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
                  <UsersInfo users={message?.readBy} />
                )}
              </div>

              {/* Reactions */}
              {isNotEmpty(message?.reactions) &&
                uniqueReactions.map((reaction, idx) => {
                  const emoji = reaction?.emoji;
                  const total = reaction?.total;

                  return (
                    <div
                      key={idx}
                      className={styles.emojiReaction}
                      onClick={() => handleReactionClick(emoji)}
                      onMouseEnter={() => setHoveredEmoji(emoji)}
                      onMouseLeave={() => setHoveredEmoji(null)}
                      title={hasUserReacted ? "Retirer votre réaction" : ""}
                    >
                      <span className={styles.emojiIcon}>{emoji}</span>
                      <span className={styles.emojiCount}>{total}</span>
                      {/* Affichage des avatars des utilisateurs qui ont réagi */}
                      {hoveredEmoji === emoji && (
                        <UsersInfo users={usersWhoReacted} />
                      )}
                    </div>
                  );
                })}

              {/* Bouton ajouter une réaction */}
              {uid !== author?._id && canReact && (
                <div className={styles.reactions}>
                  <SmilePlus size={16} onClick={handleReactionsButtonClick} />
                  {showEmojiPicker && (
                    <div className={styles.emojiPicker}>
                      <EmojiPicker
                        reactionsDefaultOpen={true}
                        height={350}
                        width={300}
                        className={styles.reactionEmojiPicker}
                        onEmojiClick={(emoji) =>
                          handleReactionClick(emoji.emoji)
                        }
                      />
                    </div>
                  )}
                </div>
              )}
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

{
  /* <div className={styles.emojiReactions}>
  {Object.entries(groupedReactions).map(([emoji, userIds]) => {
    const usersForThisEmoji = getUsersByReactionEmoji(emoji); */
}
// return (
//   <div
//     key={emoji}
//     className={styles.emojiReaction}
//     onClick={() => handleReactionClick(emoji)}
//     onMouseEnter={() => setHoveredEmoji(emoji)}
//     onMouseLeave={() => setHoveredEmoji(null)}
//     title={hasUserReacted && "Retirer votre réaction"}
//   >
//     <span className={styles.emojiIcon}>{emoji}</span>
//     <span className={styles.emojiCount}>{userIds.length}</span>
//     {/* Affichage des avatars des utilisateurs qui ont réagi */}
//     {hoveredEmoji === emoji && isNotEmpty(usersForThisEmoji) && (
//       <UsersInfo users={usersForThisEmoji} />
//     )}
//   </div>
// );
//   })}
// </div>;
