import { saveTemplate } from "@/actions/template";
import PopupMessage from "@/layouts/PopupMessage";
import styles from "@/styles/components/templates/add-template.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { useActionState, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const initialState = {
  success: null,
  message: "",
  data: {},
  errors: null,
};

export default function AddTemplate({ project, setAddTemplate }) {
  const { t } = useTranslation();
  const [popup, setPopup] = useState(false);

  const saveTemplateWithT = (prevState, formData) =>
    saveTemplate(t, prevState, formData);
  const [state, formAction, pending] = useActionState(
    saveTemplateWithT,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      setAddTemplate(false);
    }

    if (state?.success === false) {
      setPopup({
        status: "failure",
        title: t("general.error_occurred"),
        message: state?.message || t("templates.template_save_error"),
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
          <span>{t("templates.save_project_as_template")}</span>
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
            placeholder={t("templates.template_name")}
            autoFocus
          />

          <button
            className={bricolageGrostesque.className}
            disabled={pending}
            data-disabled={pending}
          >
            {t("templates.save_button")}
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
