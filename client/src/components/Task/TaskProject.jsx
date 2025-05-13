import styles from "@/styles/components/task/task-project.module.css";
import Image from "next/image";

export default function TaskProject({ task }) {
  const project = task?.projectId;
  return (
    <div className={styles.container} id="task-row">
      <Image
        src={project?.logo}
        width={24}
        height={24}
        style={{ borderRadius: "50%" }}
        alt={`Logo du projet ${project?.name}`}
      />
      <span>{project?.name}</span>
    </div>
  );
}
