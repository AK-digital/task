"use client";
import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState, useEffect } from "react";
import RichTextEditor from "../RichTextEditor/RichTextEditor";
import Messages from "../messages/Messages";
import { getMessages } from "@/api/message";
import useSWR from "swr";

export default function TaskMore({ task, setTaskMore }) {
  const [editDescription, setEditDescription] = useState(false);
  const [messages, setMessages] = useState([]); // État local pour stocker les messages
  const containerRef = useRef(null);

  const getMessagesWithIds = getMessages.bind(null, task?.projectId, task?._id);

  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessagesWithIds
  );

  // Mettre à jour les messages dès que `data` change
  useEffect(() => {
    if (data?.data) {
      setMessages(data.data);
    }
  }, [data]);

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
              onClick={() => setEditDescription(true)}
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
          {isLoading ? (
            <p>Chargement des messages...</p>
          ) : (
            <Messages messages={messages} />
          )}
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
