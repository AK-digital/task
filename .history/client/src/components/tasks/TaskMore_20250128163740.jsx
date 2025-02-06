"use client";
import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useEffect, useState } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import Messages from "../messages/Messages";
import { getMessages } from "@/api/message";
import useSWR from "swr";

export default function TaskMore({ task, messages, setTaskMore }) {
  const [editDescription, setEditDescription] = useState(false);
  const [messages, setMessages] = useState([]); // État local pour les messages
  const containerRef = useRef(null);

  const getMessagesWithIds = getMessages.bind(null, task?.projectId, task?._id);

  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessagesWithIds
  );

  function handleClose(e) {
    e.preventDefault();
    const container = containerRef.current;
    container?.classList?.add(styles["container-close"]);

    container?.addEventListener("animationend", function () {
      container?.classList?.remove(styles["container-close"]); // Remove the "close" class from the container
      setTaskMore(false); // When animation ends remove set the state to false
    });
  }

  return (
    <>
      <div className={styles.container} ref={containerRef}>
        {/* Description */}
        <div className={styles.header}>
          <div>
            <span>{task?.text}</span>
          </div>
          <div>
            <FontAwesomeIcon icon={faClose} onClick={handleClose} />
          </div>
        </div>
        <div className={styles.description}>
          <span>Description</span>
          {task?.description && !editDescription ? (
            <div
              className={styles.preview}
              onClick={(e) => setEditDescription(true)}
              dangerouslySetInnerHTML={{ __html: task?.description }}
            ></div>
          ) : (
            <RichTextEditor
              placeholder={"Ajouter une description à cette tâche"}
              type="description"
              task={task}
              setEditDescription={setEditDescription}
            />
          )}
        </div>
        {/* Conversation */}
        <div className={styles.conversation}>
          <Messages messages={data?.data} />
          <RichTextEditor
            placeholder={"Écrire un message"}
            type="conversation"
            task={task}
            setEditDescription={setEditDescription}
          />
        </div>
      </div>
      <div onClick={handleClose} id="modal-layout"></div>
    </>
  );
}
