"use client";
import { instrumentSans } from "@/utils/font";
import { useState } from "react";

export default function ProjectGuests({ content, projectId }) {
  const [modal, setModal] = useState(false);

  return (
    <button className={instrumentSans.className} onClick={handleDeleteProject}>
      {content}
    </button>
  );
}
