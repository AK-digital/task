import { useEffect, useState } from "react";

export default function TaskMore({ task, setTaskMore }) {
  const [editDescription, setEditDescription] = useState(false);
  const [messages, setMessages] = useState([]); // État local pour les messages
  const containerRef = useRef(null);

  const getMessagesWithIds = getMessages.bind(null, task?.projectId, task?._id);

  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessagesWithIds
  );

  // Mettre à jour l'état local lorsque les messages sont chargés
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
      container?.classList?.remove(styles["container-close"]);
      setTaskMore(false);
    });
  }

  return (
    <>
      <div className={styles.container} ref={containerRef}>
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
        <div className={styles.conversation}>
          <Messages messages={messages} />
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
