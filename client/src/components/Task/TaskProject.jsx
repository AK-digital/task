import styles from "@/styles/components/task/task-project.module.css";
import Image from "next/image";

export default function TaskProject({ task }) {
  const project = task?.projectId;
  return (
    <div className={styles.container} id="task-row">
      <Image
        src={project?.logo || "/default-project-logo.webp"}
        width={32}
        height={32}
        style={{ borderRadius: "50%" }}
        alt={`Logo du projet ${project?.name}`}
      />
    </div>
  );
}
