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
                width={30}
                height={30}
                quality={100}
                style={{
                    position: "relative",
                    top: "2px,"
                  objectFit: "fill",
                  borderRadius: "50%",
                }}
                alt={`Photo de profil de ${responsible?.firstName}`}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
