"use client";
import styles from "@/styles/components/projects/project-guests.module.css";
import { instrumentSans } from "@/utils/font";
import { useState } from "react";
import GuestsModal from "./GuestsModal";

export default function ProjectGuests({ project }) {
  const [modal, setModal] = useState(false);

  return (
    <>
      <button className={`${styles.button}`} onClick={(e) => setModal(true)}>
        Gérer les invités
      </button>
      {modal && <GuestsModal project={project} setModal={setModal} />}
    </>
  );
}
