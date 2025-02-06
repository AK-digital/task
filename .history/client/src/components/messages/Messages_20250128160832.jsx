"use client";
import styles from "@/styles/components/messages/messages.module.css";
import { getMessages } from "@/api/message";
import Image from "next/image";
import useSWR from "swr";
import moment from "moment";

export default function Messages({ task }) {
  const getMessagesWithIds = getMessages.bind(null, task?.projectId, task?._id);

  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessagesWithIds,
    {
      revalidateOnMount: true,
    }
  );

  const messages = data?.data;
  return (
    <div className={styles.container}>
      {messages?.map((message) => {
        const author = message?.author;

        moment.locale("fr");

        const date = moment(message?.createdAt);

        const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

        return (
          <div className={styles.message} key={message?._id}>
            {/* Author informations */}
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
            {/* text */}
            <div className={styles.text}>
              <div dangerouslySetInnerHTML={{ __html: message?.message }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
