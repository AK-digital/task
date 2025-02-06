import styles from "@/styles/components/messages/message.module.css";
import { useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { deleteMessage } from "@/api/message";
import { mutate } from "swr";

export default function Message({ message }) {
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);
  moment.locale("fr");
  const author = message?.author;

  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  async function handleDeleteMessage() {
    setIsLoading(true);
    const response = await deleteMessage(message?.projectId, message?._id);

    if (response.success) {
      mutate(
        `/message?projectId=${message?.projectId}&taskId=${message?.taskId}`
      );
    }
  }

  return (
    <div className={styles.container} data-loading={isLoading}>
      {/* Author informations */}
      <div className={styles.header}>
        <div className={styles.user}>
          <Image
            src={author?.picture || "/default-pfp.webp"}
            width={35}
            height={35}
            alt={`Photo de profil de ${author?.picture}`}
            style={{ borderRadius: "50%" }}
          />
          <span className={styles.names}>
            {author?.firstName + " " + author?.lastName}
          </span>
          <span className={styles.date}>{formattedDate}</span>
        </div>
        <div className={styles.ellipsis}>
          <FontAwesomeIcon icon={faEllipsisH} onClick={(e) => setMore(true)} />
          {more && (
            <div className={styles.more}>
              <ul>
                <li>Modifier</li>
                <li onClick={handleDeleteMessage}>Supprimer</li>
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
  );
}
