import styles from "@/styles/components/task/task-project.module.css";
import Image from "next/image";
import { useTranslation } from "react-i18next";

export default function TaskProject({ task }) {
  const { t } = useTranslation();
  const project = task?.projectId;
  return (
    <div className={styles.container} id="task-row">
      <Image
        src={project?.logo || "/default-project-logo.webp"}
        width={32}
        height={32}
        style={{ borderRadius: "50%" }}
        alt={`${t("projects.project_logo_alt")} ${project?.name}`}
      />
    </div>
  );
}
