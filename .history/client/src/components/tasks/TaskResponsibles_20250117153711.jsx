"use client";
import styles from "@/styles/components/tasks/task-responsibles.module.css";
import Image from "next/image";
import { useState } from "react";

export default function TaskResponsibles({ task, project }) {
  const [openModal, setOpenModal] = useState(false);
  const responsibles = task?.responsibles;

  return (
    <div className={styles.container} onClick={(e) => setOpenModal(true)}>
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
      {/* MODAL */}
      {openModal && (
        <div className={styles.modal}>
          <ul>
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
                  <span className={styles.email}>{responsible?.email}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
