"use client";
import styles from "@/styles/components/tasks/task-responsibles.module.css";
import { isNotEmpty } from "@/utils/utils";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { useState } from "react";

export default function TaskResponsibles({ task, project }) {
  const [openModal, setOpenModal] = useState(false);
  const responsibles = task?.responsibles;
  const guests = project?.guests;
  const author = project?.author;
  console.log(project);

  return (
    <div className={styles.container}>
      {isNotEmpty(responsibles) ? (
        <ul className={styles.list}>
          {responsibles.map((responsible) => {
            return (
              <li key={responsible?._id}>
                <Image
                  src={responsible?.picture || "/default-pfp.webp"}
                  width={30}
                  height={30}
                  quality={100}
                  style={{
                    position: "relative",
                    top: "1px",
                    objectFit: "fill",
                    borderRadius: "50%",
                  }}
                  alt={`Photo de profil de ${responsible?.firstName}`}
                />
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.plus} onClick={(e) => setOpenModal(!openModal)}>
          <FontAwesomeIcon icon={faPlus} />
        </div>
      )}
      {/* MODAL */}
      {openModal && (
        <div className={styles.modal}>
          <div>
            {/* responsibles */}
            <ul></ul>
          </div>
          <div>
            <span>Personnes à inviter</span>
            <ul>
              <li>
                {" "}
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
              {guests?.map((guest) => {
                return (
                  <li key={guest?._id}>
                    <Image
                      src={guest?.picture || "/default-pfp.webp"}
                      width={30}
                      height={30}
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
      )}
    </div>
  );
}
