"use client";
import { AuthContext } from "@/context/auth";
import styles from "@/styles/components/richTextEditor/mentions-list.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

export default function MentionsList({ project }) {
  console.log(project);
  const { uid } = useContext(AuthContext);
  const guests = [project?.author, ...project?.guests];
  const [selectedIdx, setSelectedIdx] = useState(null);

  useEffect(() => {
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        console.log("played");
        setSelectedIdx(0);
      }
    });
  }, []);

  return (
    <div className={styles.container}>
      {isNotEmpty(guests) && (
        <div className={styles.guests}>
          <ul className={styles.items}>
            {guests?.map((guest, idx) => {
              return (
                <li
                  className={styles.item}
                  key={guest?._id}
                  data-active={idx === selectedIdx}
                >
                  <Image
                    src={guest?.picture || "/default-pfp.webp"}
                    width={22}
                    height={22}
                    alt={`Photo de profil de ${guest?.firstName}`}
                    style={{ borderRadius: "50%" }}
                  />
                  {guest?.firstName + " " + guest?.lastName}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
