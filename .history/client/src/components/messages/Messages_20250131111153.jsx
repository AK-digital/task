"use client";
import styles from "@/styles/components/messages/messages.module.css";
import { getMessages } from "@/api/message";
import useSWR from "swr";
import { isNotEmpty } from "@/utils/utils";
import Message from "./Message";

export default function Messages({ task, project }) {
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}&taskId=${task?._id}`,
    () => getMessages(task.projectId, task._id)
  );

  const messages = data?.data;

  return (
    <div className={styles.container}>
      {isNotEmpty(messages) &&
        messages?.map((message) => {
          return (
            <Message
              message={message}
              mutate={mutate}
              task={task}
              key={message?._id}
            />
          );
        })}
    </div>
  );
}
