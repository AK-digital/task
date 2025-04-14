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
import { mutate } from "swr";

export default function Message({ task, message, project, mutateMessage }) {
  const { uid } = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);
  moment.locale("fr");
  const author = message?.author;
  // const isUpdated = message?.createdAt !== message?.updatedAt;

  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  const handleReadBy = useCallback(async () => {
    if (uid === author?._id) return;

    if (!message?.readBy?.includes(uid)) {
      const response = await updateReadBy(project?._id, message?._id);
      console.log(response);
      if (!response.success) return;

      socket.emit("update task", project?._id);
    }
  }, [uid, author?._id, message?.readBy]);

  useEffect(() => {
    handleReadBy();
  }, []);

  async function handleDeleteMessage() {
    setMore(false);
    setIsLoading(true);
    const response = await deleteMessage(message?.projectId, message?._id);

    if (!response?.success) {
      setIsLoading(false);
    }

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
            {/* Author informations */}
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
                {/* {isUpdated && <span className={styles.updated}>Modifié</span>} */}
              </div>
              <div className={styles.ellipsis}>
                {uid === author?._id && (
                  <FontAwesomeIcon
                    icon={faEllipsisH}
                    onClick={(e) => setMore(true)}
                  />
                )}
                {more && (
                  <div className={styles.more}>
                    <ul>
                      <li
                        onClick={(e) => {
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
            {/* text */}
            <div className={styles.text}>
              <div dangerouslySetInnerHTML={{ __html: message?.message }}></div>
            </div>
          </div>
          {more && (
            <div
              id="modal-layout-opacity"
              onClick={(e) => setMore(false)}
            ></div>
          )}
        </>
      )}
    </>
  );
}
