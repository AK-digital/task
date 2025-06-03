"use client";
import { deleteTemplate, useTemplate } from "@/api/template";
import styles from "@/styles/components/templates/template.module.css";
import { List, ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function Template({ elt }) {
  const { t } = useTranslation();
  const router = useRouter();

  const handleUseTemplate = async () => {
    const res = await useTemplate(elt?._id);

    if (res.success) {
      const projectId = res?.data?._id;
      router.push(`/projects/${projectId}`);
    }
  };

  const handleDelete = async () => {
    await deleteTemplate(elt?._id);
  };

  const hasDescription = elt?.description;
  return (
    <div className={styles.container}>
      <div className={styles.infos}>
        <div>
          <h3>{elt?.name}</h3>
        </div>
        {hasDescription && (
          <div>
            <p>{elt?.description}</p>
          </div>
        )}
        <div>
          <span>
            <List size={16} />
            <span>{elt?.boardsCount}</span>
          </span>
        </div>
        <div>
          <span>
            <ListTodo size={16} />
            {elt?.tasksCount}
          </span>
        </div>
      </div>
      <div>
        <button onClick={handleUseTemplate}>
          {t("templates.use_template")}
        </button>
        <button onClick={handleDelete}>{t("templates.delete")}</button>
      </div>
    </div>
  );
}
