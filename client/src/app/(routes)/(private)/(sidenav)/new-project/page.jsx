"use client";
import { saveProject } from "@/actions/project";
import styles from "@/styles/pages/new-project.module.css";
import { instrumentSans } from "@/utils/font";
import { FolderPlus, Layout, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  data: null,
  errors: null,
};

export default function NewProject() {
  const { t } = useTranslation();
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [state, formAction, pending] = useActionState(
    saveProject,
    initialState
  );

  const router = useRouter();

  useEffect(() => {
    if (state?.status === "success" && state?.data?._id) {
      router.push(`/projects/${state.data._id}/`);
    }
  }, [state]);

  return (
    <main className={styles.main}>
      {/* container */}
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.header}>
            <FolderPlus size="144" />
            <h1>{t("projects.new_project")}</h1>
            <p>{t("projects.new_project_description")}</p>
          </div>
          <div className={styles.content}>
            <form action={formAction} className={styles.form}>
              <div className={styles.input}>
                <label htmlFor="project-name" hidden></label>
                <input
                  type="text"
                  id="project-name"
                  name="project-name"
                  placeholder={t("projects.project_name")}
                  onChange={(e) => {
                    if (e.target.value.length > 0) {
                      setIsSubmitDisabled(false);
                    } else {
                      setIsSubmitDisabled(true);
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className={styles.buttons}>
                <div>
                  <button
                    className={`${styles.submit} ${
                      isSubmitDisabled ? styles.disabled : ""
                    }`}
                    data-disabled={pending || isSubmitDisabled}
                    type="submit"
                    disabled={pending || isSubmitDisabled}
                  >
                    <PlusCircle size={18} /> {t("projects.create_new_project")}
                  </button>
                  <button
                    type="button"
                    className={styles.template}
                    disabled={pending}
                    onClick={(e) => {
                      e.preventDefault();
                      router.push("/new-project/templates");
                    }}
                  >
                    <Layout size={18} />
                    {t("projects.choose_template")}
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.back}
                  onClick={(e) => {
                    e.preventDefault();
                    router.back();
                  }}
                >
                  {t("projects.back")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
