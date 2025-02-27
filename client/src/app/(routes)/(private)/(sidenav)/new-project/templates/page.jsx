"use server";
import { getTemplates } from "@/api/template";
import Templates from "@/components/Templates/Templates";
import styles from "@/styles/pages/templates.module.css";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <Templates templates={templates} />
      </div>
    </main>
  );
}
