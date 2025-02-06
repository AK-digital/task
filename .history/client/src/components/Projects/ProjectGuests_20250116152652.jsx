"use client";
import { instrumentSans } from "@/utils/font";
import { useRouter } from "next/navigation";

export default function ProjectGuests({ content, projectId }) {
  return (
    <button className={instrumentSans.className} onClick={handleDeleteProject}>
      {content}
    </button>
  );
}
