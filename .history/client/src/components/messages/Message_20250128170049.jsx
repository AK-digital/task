import styles from "@/styles/components/messages/message.module.css";
import { useState } from "react";

export default function Message({ message }) {
  const [more, setMore] = useState(false);
  moment.locale("fr");
  const author = message?.author;

  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  return (
    <div className={styles.container}>
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
                <li>Supprimer</li>
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
