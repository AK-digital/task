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
  console.log(project);

  return (
    <div className={styles.container} onClick={(e) => setOpenModal(true)}>
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
        <div>
          <FontAwesomeIcon icon={faPlus} />
        </div>
      )}
      {/* MODAL */}
      {openModal && isNotEmpty(guests) && (
        <div className={styles.modal}>
          <ul>
            {guests.map((guest) => {
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
      )}
    </div>
  );
}
