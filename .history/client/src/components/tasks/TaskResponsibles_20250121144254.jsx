"use client";
import { addResponsible, removeResponsible } from "@/api/task";
import styles from "@/styles/components/tasks/task-responsibles.module.css";
import { isNotEmpty } from "@/utils/utils";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";

export default function TaskResponsibles({ task, project }) {
  const [openModal, setOpenModal] = useState(false);
  const responsibles = task?.responsibles;
  const guests = project?.guests;
  const author = project?.author;

  console.log(responsibles, guests);

  const filteredGuests = guests.filter(
    (guest) =>
      !responsibles.some((responsible) => responsible?._id === guest?._id)
  );

  // Chekcs if author is already in responsibles arr
  const filteredAuthor = responsibles?.some(
    (responsible) => responsible?._id === author?._id
  );

  console.log(filteredAuthor);

  async function handleAddResponsible(e, responsibleId) {
    await addResponsible(task?._id, responsibleId, project?._id);
  }

  async function handleRemoveResponsible(e, responsibleId) {
    await removeResponsible(task?._id, responsibleId, project?._id);
  }

  return (
    <div className={styles.container}>
      {isNotEmpty(responsibles) ? (
        <ul className={styles.list} onClick={(e) => setOpenModal(!openModal)}>
          {responsibles.slice(0, 3).map((responsible) => {
            return (
              <li key={responsible?._id}>
                <Image
                  src={responsible?.picture || "/default-pfp.webp"}
                  width={40}
                  height={35}
                  quality={100}
                  style={{
                    objectFit: "ill",
                    borderRadius: "50%",
                  }}
                  alt={`Photo de profil de ${responsible?.firstName}`}
                />
              </li>
            );
          })}
          {responsibles?.length > 3 && (
            <li className={styles.count}>+{responsibles?.length}</li>
          )}
        </ul>
      ) : (
        <div className={styles.plus} onClick={(e) => setOpenModal(!openModal)}>
          <FontAwesomeIcon icon={faPlus} />
        </div>
      )}
      {/* MODAL */}
      {openModal && (
        <>
          <div className={styles.modal}>
            {isNotEmpty(responsibles) && (
              <div className={styles["responsibles__container"]}>
                {/* Responsibles */}
                <ul className={styles["responsibles__list"]}>
                  {responsibles?.map((responsible) => {
                    return (
                      <li
                        key={responsible?._id}
                        onClick={(e) => {
                          handleRemoveResponsible(e, responsible?._id);
                        }}
                      >
                        <Image
                          src={responsible?.picture || "/default-pfp.webp"}
                          width={20}
                          height={20}
                          quality={100}
                          style={{
                            objectFit: "fill",
                            borderRadius: "50%",
                          }}
                          alt={`Photo de profil de ${responsible?.firstName}`}
                        />
                        {responsible?.firstName + " " + responsible?.lastName}
                        <FontAwesomeIcon icon={faX} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {/* Guests (Can be set as responsible) */}
            <div className={styles["guests__container"]}>
              <span className={styles["guests__title"]}>
                Personnes à inviter
              </span>
              <ul className={styles["guests__list"]}>
                {!filteredAuthor && (
                  <li
                    onClick={(e) => {
                      handleAddResponsible(e, author?._id);
                    }}
                  >
                    <Image
                      src={author?.picture || "/default-pfp.webp"}
                      width={25}
                      height={25}
                      quality={100}
                      style={{
                        position: "relative",
                        top: "1px",
                        objectFit: "fill",
                        borderRadius: "50%",
                      }}
                      alt={`Photo de profil de ${author?.firstName}`}
                    />
                    <span className={styles.email}>{author?.email}</span>
                  </li>
                )}
                {filteredGuests?.map((guest) => {
                  return (
                    <li
                      key={guest?._id}
                      onClick={(e) => {
                        handleAddResponsible(e, guest?._id);
                      }}
                    >
                      <Image
                        src={guest?.picture || "/default-pfp.webp"}
                        width={25}
                        height={25}
                        quality={100}
                        style={{
                          position: "relative",
                          top: "1px",
                          objectFit: "fill",
                          borderRadius: "50%",
                        }}
                        alt={`Photo de profil de ${guest?.firstName}`}
                      />
                      <span className={styles.email}>{guest?.email}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
          <div
            id="modal-layout-opacity"
            onClick={(e) => setOpenModal(false)}
          ></div>
        </>
      )}
    </div>
  );
}
