"use client";
import { addResponsible, removeResponsible } from "@/api/task";
import { AuthContext } from "@/context/auth";
import Modal from "@/layouts/Modal";
import styles from "@/styles/components/tasks/task-responsibles.module.css";
import socket from "@/utils/socket";
import { checkRole, isNotEmpty } from "@/utils/utils";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useCallback, useContext, useEffect, useState } from "react";
import NoPicture from "../User/NoPicture";
import { mutate } from "swr";

export default function TaskResponsibles({ task, project, archive }) {
  const { user, uid } = useContext(AuthContext);
  const [optimisticResponsibles, setOptimisticResponsibles] = useState(
    task?.responsibles || []
  );
  const [openModal, setOpenModal] = useState(false);
  const members = project?.members || [];
  const responsibles = task?.responsibles || [];
  const [filteredMembers, setFilteredMembers] = useState(
    members.filter(
      (member) =>
        !responsibles.some(
          (responsible) => responsible?._id === member?.user?._id
        )
    )
  );

  useEffect(() => {
    const newMembers = members.filter(
      (member) =>
        !optimisticResponsibles.some(
          (responsible) => responsible?._id === member?.user?._id
        )
    );

    setFilteredMembers(newMembers);
  }, [optimisticResponsibles, members]);

  useEffect(() => {
    setOptimisticResponsibles(task?.responsibles || []);
  }, [task?.responsibles]);

  async function handleAddResponsible(responsible) {
    const previousResponsibles = [...optimisticResponsibles];

    // Mise à jour optimiste
    setOptimisticResponsibles((prev) => {
      if (prev.some((r) => r._id === responsible._id)) return prev;
      return [...prev, responsible];
    });

    const response = await addResponsible(
      task?._id,
      responsible?._id,
      project?._id
    );

    if (!response?.success) {
      setOptimisticResponsibles(previousResponsibles);
      return;
    }

    await mutate(`/task?projectId=${project?._id}&archived=${archive}`);

    socket.emit("update task", project?._id);

    // Ne pas envoyer de notification si c'est l'utilisateur qui s'ajoute lui-même
    if (responsible?._id === uid) return;

    const message = {
      title: `🎉 Une tâche vous a été assignée dans ${project?.name}`,
      content: `Vous venez d'être nommé responsable de la tâche "${task?.text}".`,
    };

    const link = `/projects/${project?._id}/task/${task?._id}`;

    socket.emit("create notification", user, responsible?.email, message, link);
  }

  async function handleRemoveResponsible(responsible) {
    const previousResponsibles = [...optimisticResponsibles];

    // Mise à jour optimiste
    setOptimisticResponsibles((prev) =>
      prev.filter((r) => r._id !== responsible._id)
    );

    const response = await removeResponsible(
      task?._id,
      responsible?._id,
      project?._id
    );

    if (!response?.success) {
      setOptimisticResponsibles(previousResponsibles);
      return;
    }

    socket.emit("update task", project?._id);
  }

  const handleModal = useCallback(() => {
    if (archive) return;

    const isAuthorized = checkRole(
      project,
      ["owner", "manager", "team", "customer"],
      uid
    );

    if (!isAuthorized) return;

    setOpenModal(!openModal);
  }, [project, uid]);

  useEffect(() => {
    function handleResponsibleUpdate(taskId, updateData) {
      if (task?._id !== taskId) return;

      setOptimisticResponsibles((prev) => {
        if (updateData?.removed) {
          return prev.filter((r) => r._id !== updateData?.responsible._id);
        }

        if (prev.some((r) => r?._id === updateData?._id)) return prev;
        return [...prev, updateData];
      });
    }

    socket.on("task responsible updated", handleResponsibleUpdate);

    return () => {
      socket.off("task responsible updated", handleResponsibleUpdate);
    };
  }, [task]);

  return (
    <div className={styles.container}>
      {isNotEmpty(optimisticResponsibles) ? (
        <ul className={styles.list} onClick={handleModal}>
          {optimisticResponsibles.slice(0, 3).map((responsible) => (
            <li key={responsible?._id}>
              {responsible?.picture ? (
                <Image
                  src={responsible?.picture || "/default-pfp.webp"}
                  width={30}
                  height={30}
                  quality={100}
                  style={{
                    objectFit: "cover",
                    borderRadius: "50%",
                    cursor: "pointer",
                  }}
                  alt={`Photo de profil de ${responsible?.firstName}`}
                />
              ) : (
                <NoPicture user={responsible} width={30} height={30} />
              )}
            </li>
          ))}
          {optimisticResponsibles.length > 3 && (
            <li className={styles.count}>
              +{optimisticResponsibles.length - 3}
            </li>
          )}
        </ul>
      ) : (
        <div className={styles.plus} onClick={handleModal}>
          <FontAwesomeIcon icon={faPlus} cursor={"pointer"} />
        </div>
      )}

      {/* MODAL */}
      {openModal && (
        <Modal setOpenModal={setOpenModal}>
          <div className={styles.modal}>
            {isNotEmpty(optimisticResponsibles) && (
              <div className={styles["responsibles__container"]}>
                <ul className={styles["responsibles__list"]}>
                  {optimisticResponsibles.map((responsible) => (
                    <li
                      key={responsible?._id}
                      onClick={() => handleRemoveResponsible(responsible)}
                    >
                      <Image
                        src={responsible?.picture || "/default-pfp.webp"}
                        width={20}
                        height={20}
                        quality={100}
                        style={{ objectFit: "fill", borderRadius: "50%" }}
                        alt={`Photo de profil de ${responsible?.firstName}`}
                      />
                      {responsible?.firstName + " " + responsible?.lastName}
                      <FontAwesomeIcon icon={faX} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isNotEmpty(filteredMembers) && (
              <div className={styles["guests__container"]}>
                <span className={styles["guests__title"]}>
                  Personnes à inviter
                </span>
                <ul className={styles["guests__list"]}>
                  {filteredMembers.map((member) => (
                    <li
                      key={member?.user?._id}
                      onClick={() => handleAddResponsible(member?.user)}
                    >
                      {member?.user?.picture ? (
                        <Image
                          src={member?.user?.picture || "/default-pfp.webp"}
                          width={25}
                          height={25}
                          quality={100}
                          style={{ objectFit: "fill", borderRadius: "50%" }}
                          alt={`Photo de profil de ${member?.user?.firstName}`}
                        />
                      ) : (
                        <NoPicture user={member?.user} width={25} height={25} />
                      )}
                      <span className={styles.email}>
                        {member?.user?.email}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
