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
import { deleteMessage, updateReadBy } from "@/api/message";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import Tiptap from "../RichTextEditor/Tiptap";
import { Eye } from "lucide-react";
import { isNotEmpty } from "@/utils/utils";
import UsersInfo from "../Popups/UsersInfo";
import Reactions from "../Reactions/Reactions";

export default function Message({ task, message, project, mutateMessage }) {
  const { uid } = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [showPeopleRead, setShowPeopleRead] = useState(false);

  moment.locale("fr");
  const author = message?.author;
  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

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
              <Reactions
                element={message}
                project={project}
                task={task}
                mutateMessage={mutateMessage}
                type={"message"}
              />
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
