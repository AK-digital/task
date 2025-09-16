"use client";
import { isNotEmpty } from "@/utils/utils";
import Message from "./Message";
import { useCallback, useEffect, useState } from "react";
import socket from "@/utils/socket";
import { ClipboardCheck, MessagesSquareIcon } from "lucide-react";
import Tiptap from "../RichTextEditor/Tiptap";
import { useUserRole } from "../../../hooks/useUserRole";
import { useMessages } from "../../../hooks/useMessages";
import { useDrafts } from "../../../hooks/useDrafts";
import MessagesSkeleton from "./MessagesSkeleton";
import PendingMessage from "./PendingMessage";

export default function Messages({
  task,
  project,
  mutateTasks,
  showPreviewImageMessage,
  setShowPreviewImageMessage,
  edit,
  setEdit,
}) {
  const { draft, mutateDraft } = useDrafts(
    project?._id, 
    task?.isSubtask ? (task?.taskId?._id || task?.taskId) : task?._id, 
    "message"
  );
  const { messages, messageLoading, mutate } = useMessages(
    project?._id,
    task?.isSubtask ? (task?.taskId?._id || task?.taskId) : task?._id,
    task?.isSubtask ? task?._id : null
  );
  const [message, setMessage] = useState("");
  // const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

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
    if (draft?.success) {
      setMessage(draft?.data?.content);
    }

    if (!draft?.success) {
      setMessage("");
      setEdit("");
    }
  }, [draft]);

  const handleIsOpen = useCallback(() => {
    if (!isAuthorized) return;

    setEdit(message?._id);
  }, [project, message, edit]);

  return (
    <div className="flex flex-col gap-[15px]">
      <span className="flex items-center gap-2 text-large text-text-dark-color font-medium select-none [&_svg]:text-text-color-muted">
        <MessagesSquareIcon size={18} /> Conversation
      </span>
      {/* Loading */}
      {messageLoading && <MessagesSkeleton />}
      {/* Messages */}
      {!messageLoading &&
        isNotEmpty(messages) &&
        messages?.map((message) => {
          return (
            <Message
              task={task}
              message={message}
              setMessage={setMessage}
              mutateMessage={mutate}
              project={project}
              mutateTasks={mutateTasks}
              key={message?._id}
              mutateDraft={mutateDraft}
              showPreviewImageMessage={showPreviewImageMessage}
              setShowPreviewImageMessage={setShowPreviewImageMessage}
              edit={edit}
              setEdit={setEdit}
            />
          );
        })}
      {isPending && <PendingMessage message={message} />}
      {edit === message?._id && (
        <Tiptap
          project={project}
          task={task}
          type="message"
          message={message}
          setMessage={setMessage}
          setIsMessagePending={setIsPending}
          setConvOpen={setEdit}
          draft={draft}
          mutateDraft={mutateDraft}
          showPreviewImageMessage={showPreviewImageMessage}
          setShowPreviewImageMessage={setShowPreviewImageMessage}
        />
      )}
      {edit !== message?._id && !messageLoading && (
        <div
          className="flex justify-between items-center border-[1.5px] border-color-border-color py-3 px-4 rounded-lg text-small data-[role=true]:cursor-pointer select-none"
          onClick={handleIsOpen}
          data-role={isAuthorized}
        >
          {isAuthorized ? (
            <p>Rédiger une réponse et mentionner des utilisateurs avec @</p>
          ) : (
            <p>Impossible de rédiger un message en tant qu'invité</p>
          )}
          {draft?.success && (
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-text-color-muted" />
              <p className="text-xs text-text-color-muted">
                Brouillon sauvegardé
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
