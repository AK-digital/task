"use client";
import styles from "@/styles/components/messages/messages.module.css";
import { isNotEmpty } from "@/utils/utils";
import Message from "./Message";
import { useCallback, useEffect, useState } from "react";
import socket from "@/utils/socket";
import { MessagesSquareIcon } from "lucide-react";
import Tiptap from "../RichTextEditor/Tiptap";
import { useUserRole } from "@/app/hooks/useUserRole";
import { useMessages } from "@/app/hooks/useMessages";
import { useDrafts } from "@/app/hooks/useDrafts";
import MessagesSkeleton from "./MessagesSkeleton";

export default function Messages({ task, project, mutateTasks }) {
  const { draft, mutateDraft } = useDrafts(project?._id, task?._id, "message");
  const { messages, messageLoading, mutate } = useMessages(
    project?._id,
    task?._id
  );

  const [message, setMessage] = useState("");
  const [isOpen, setIsOpen] = useState(false);

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

      {messageLoading && <MessagesSkeleton />}

      {!messageLoading &&
        isNotEmpty(messages) &&
        messages?.map((message) => (
          <Message
            task={task}
            message={message}
            mutateMessage={mutate}
            project={project}
            mutateTasks={mutateTasks}
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
