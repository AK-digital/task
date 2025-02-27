import { saveTemplate } from "@/actions/template";
import PopupMessage from "@/layouts/PopupMessage";
import styles from "@/styles/components/templates/add-template.module.css";
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
    if (state?.success === true) {
      setPopup({
        status: "success",
        title: "Template enregistrées avec succès",
        message: "Le template a été enregistré avec succès",
      });
      setAddTemplate(false);
    }

    if (state?.status === false) {
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
      <div className={styles.container} id="popover">
        <div className={styles.header}>
          <span>Ajouter au template</span>
        </div>
        <form action={formAction} className={styles.form}>
          <div>
            <input
              type="text"
              id="project-id"
              name="project-id"
              defaultValue={project?._id}
              hidden
            />
            <label htmlFor="template-name">Nom</label>
            <input
              type="text"
              id="template-name"
              name="template-name"
              defaultValue={project?.name}
            />
          </div>
          <button>Enregistrer</button>
        </form>
      </div>
      <div
        id="modal-layout-opacity"
        onClick={(e) => setAddTemplate(false)}
      ></div>
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
