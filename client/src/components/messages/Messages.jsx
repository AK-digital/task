"use client";
import styles from "@/styles/components/messages/messages.module.css";
import { getMessages } from "@/api/message";
import useSWR from "swr";
import { isNotEmpty } from "@/utils/utils";
import Message from "./Message";
import { useEffect } from "react";
import socket from "@/utils/socket";

export default function Messages({ task, project }) {
  const messagesWithIds = getMessages.bind(null, task.projectId, task._id);

  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}&taskId=${task?._id}`,
    messagesWithIds
  );

  const messages = data?.data;

  useEffect(() => {
    socket.on("message updated", () => {
      mutate();
    });

    return () => {
      socket.off("message updated");
    };
  }, [socket]);

  if (!isNotEmpty(messages)) return null; // Returb null if there is no messages

  return (
    <div className={styles.container}>
      {messages?.map((message) => (
        <Message
          message={message}
          mutate={mutate}
          project={project}
          key={message?._id}
        />
      ))}
    </div>
  );
}
