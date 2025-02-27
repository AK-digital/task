"use client";
import { saveProject } from "@/actions/project";
import styles from "@/styles/pages/new-project.module.css";
import { instrumentSans } from "@/utils/font";
import { FolderPlus, Layout, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  status: "pending",
  message: "",
  payload: null,
  data: null,
  errors: null,
};

export default function NewProject() {
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
            <h1>Créer un projet</h1>
            <p>
              Créer un nouveau projet n'a jamais été aussi simple. Donnez un nom
              à votre projet pour démarrer un nouveau projet ou profitez de nos
              templates prédéfinies pour gagner du temps.
            </p>
          </div>
          <div className={styles.content}>
            <form action={formAction} className={styles.form}>
              <div>
                <label htmlFor="project-name" hidden></label>
                <input
                  type="text"
                  id="project-name"
                  name="project-name"
                  placeholder="Nom du projet"
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
                    <PlusCircle size={18} /> Créer un nouveau projet
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
                    Choisir un template
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
                  Retour
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
