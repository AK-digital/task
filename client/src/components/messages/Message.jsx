"use client";
import styles from "@/styles/components/messages/message.module.css";
import { useContext, useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faPen,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { deleteMessage } from "@/api/message";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";

export default function Message({ message, project, mutate }) {
  const { uid } = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);
  moment.locale("fr");
  const author = message?.author;
  const isUpdated = message?.createdAt !== message?.updatedAt;

  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  async function handleDeleteMessage() {
    setMore(false);
    setIsLoading(true);
    const response = await deleteMessage(message?.projectId, message?._id);

    if (!response?.success) {
      setIsLoading(false);
    }
    await mutate();
    socket.emit("update message", message?.projectId);
    setIsLoading(false);
  }

  return (
    <>
      {edit ? (
        <RichTextEditor
          type={"conversation"}
          message={message}
          task={null}
          project={project}
          setEditDescription={null}
          edit={edit}
          setEdit={setEdit}
          setConvLoading={setIsLoading}
          placeholder={null}
          mutateMessage={mutate}
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
                {isUpdated && <span className={styles.updated}>Modifié</span>}
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
