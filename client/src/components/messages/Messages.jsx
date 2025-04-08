"use client";
import styles from "@/styles/components/messages/messages.module.css";
import { getMessages } from "@/api/message";
import useSWR from "swr";
import { isNotEmpty } from "@/utils/utils";
import Message from "./Message";
import { useCallback, useEffect, useState } from "react";
import socket from "@/utils/socket";
import { MessagesSquareIcon } from "lucide-react";
import Tiptap from "../RichTextEditor/Tiptap";
import { getDrafts } from "@/api/draft";
import { useUserRole } from "@/app/hooks/useUserRole";

export default function Messages({ task, project }) {
  const fetcher = getDrafts.bind(null, task?.projectId, task?._id, "message");
  const { data: draft, mutate: mutateDraft } = useSWR(
    `/draft?projectId=${task?.projectId}&taskId=${task?._id}&type=message`,
    fetcher
  );

  const messagesWithIds = getMessages.bind(null, task.projectId, task._id);
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}&taskId=${task?._id}`,
    messagesWithIds
  );

  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const messages = data?.data;

  const isAuthorized = useUserRole(project, [
    "owner",
    "manager",
    "team",
    "customer",
  ]);

  useEffect(() => {
    socket.on("message updated", () => {
      mutate();
    });

    return () => {
      socket.off("message updated");
    };
  }, [socket]);

  useEffect(() => {
    setIsOpen(false);
    if (draft?.success) {
      setIsOpen(true);
      setMessage(draft?.data?.content);
    }

    if (!draft?.success) {
      setMessage("");
      setIsOpen(false);
    }
  }, [draft]);

  const handleIsOpen = useCallback(() => {
    if (!isAuthorized) return;

    setIsOpen(true);
  }, [project]);

  return (
    <div className={styles.container}>
      <span className={styles.title}>
        <MessagesSquareIcon size={18} /> Conversation
      </span>
      {isNotEmpty(messages) &&
        messages?.map((message) => (
          <Message
            task={task}
            message={message}
            mutateMessage={mutate}
            project={project}
            key={message?._id}
          />
        ))}
      {isOpen && (
        <Tiptap
          project={project}
          task={task}
          type="message"
          message={message}
          setConvOpen={setIsOpen}
          draft={draft}
          mutateDraft={mutateDraft}
        />
      )}
      {!isOpen && (
        <div
          className={styles.empty}
          onClick={handleIsOpen}
          data-role={isAuthorized}
        >
          {isAuthorized ? (
            <p>Rédiger une réponse et mentionner des utilisateurs avec @</p>
          ) : (
            <p>Impossible de rédiger un message en tant qu'invité</p>
          )}
        </div>
      )}
    </div>
  );
}
