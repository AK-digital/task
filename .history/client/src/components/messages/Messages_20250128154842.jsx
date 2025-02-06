"use client";
import styles from "@/styles/components/messages/messages.module.css";
import { getMessages } from "@/api/message";
import Image from "next/image";
import useSWR from "swr";

export default function Messages({ task }) {
  const getMessagesWithIds = getMessages.bind(null, task?.projectId, task?._id);

  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessagesWithIds
  );

  const messages = data?.data;
  return (
    <div className={styles.container}>
      {messages?.map((message) => {
        const author = message?.author;

        return (
          <div className={styles.messages} key={message?._id}>
            {/* Author informations */}
            <div className={styles.user}>
              <Image
                src={author?.picture || "/default-pfp.webp"}
                width={40}
                height={40}
                alt={`Photo de profil de ${author?.picture}`}
                style={{ borderRadius: "50%" }}
              />
              <span>{author?.firstName + " " + author?.lastName}</span>
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
