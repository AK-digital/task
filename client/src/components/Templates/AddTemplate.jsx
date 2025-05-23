import { saveTemplate } from "@/actions/template";
import PopupMessage from "@/layouts/PopupMessage";
import styles from "@/styles/components/templates/add-template.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  success: null,
  message: "",
  data: {},
  errors: null,
};

export default function AddTemplate({ project, setAddTemplate }) {
  const [popup, setPopup] = useState(false);
  const [state, formAction, pending] = useActionState(
    saveTemplate,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      setAddTemplate(false);
    }

    if (state?.success === false) {
      setPopup({
        status: "failure",
        title: "Une erreur s'est produite",
        message:
          state?.message ||
          "Une erreur s'est produite lors de l'enregistrement du template",
      });
    }

    // Hide the popup after 4 seconds
    const timeout = setTimeout(() => setPopup(false), 4000);

    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Enregistrer ce projet comme modèle</span>
        </div>
        <form action={formAction} className={styles.form}>
          <input
            type="text"
            id="project-id"
            name="project-id"
            defaultValue={project?._id}
            hidden
          />
          <input
            type="text"
            id="template-name"
            name="template-name"
            placeholder="Nom du modèle"
            autoFocus
          />

          <button
            className={bricolageGrostesque.className}
            disabled={pending}
            data-disabled={pending}
          >
            Sauvegarder
          </button>
        </form>
      </div>
      <div id="modal-layout" onClick={(e) => setAddTemplate(false)}></div>
      {popup && (
        <PopupMessage
          status={popup.status}
          title={popup.title}
          message={popup.message}
        />
      )}
    </>
  );
}
