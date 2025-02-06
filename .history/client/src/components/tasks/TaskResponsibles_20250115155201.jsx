"use client";
import styles from "@/styles/components/tasks/task-responsibles.module.css";
import Image from "next/image";

export default function TaskResponsibles({ task }) {
  const responsibles = task?.responsibles;

  console.log(responsibles);
  return (
    <div className={styles.container}>
      <ul className={styles.list}>
        {responsibles.map((responsible) => {
          return (
            <li key={responsible?._id}>
              <Image
                src={responsible?.picture || "/default-pfp.webp"}
                width={20}
                height={20}
                alt={`Photo de profil de ${responsible?.firstName}`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
