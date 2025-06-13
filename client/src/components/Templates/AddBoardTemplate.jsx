import { saveBoardTemplate } from "@/actions/boardTemplate";
import PopupMessage from "@/layouts/PopupMessage";
import { useTranslation } from "react-i18next";
import Portal from "../Portal/Portal";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  success: null,
  message: "",
  data: {},
  errors: null,
};

export default function AddBoardTemplate({ project, board, setAddTemplate }) {
  const { t } = useTranslation();
  const [popup, setPopup] = useState(false);

  const [state, formAction, pending] = useActionState(
    saveBoardTemplate,
    initialState
  );

  useEffect(() => {
    if (state?.success) {
      setPopup({
        status: "success",
        title: t("general.success"),
        message: t("board_template.create.success"),
      });
      setAddTemplate(false);
    }

    if (state?.success === false) {
      setPopup({
        status: "failure",
        title: t("general.error_occurred"),
        message: t(state?.message || "board_template.create.error"),
      });
    }

    // Hide the popup after 4 seconds
    const timeout = setTimeout(() => setPopup(false), 4000);

    return () => clearTimeout(timeout);
  }, [state, t]);

  return (
    <Portal>
      <div className="fixed z-2001 top-1/2 left-1/2 -translate-1/2 flex flex-col gap-3 bg-secondary p-6 rounded-lg shadow-medium">
        <div className="text-center text-large text-text-dark-color">
          <span>{t("templates.save_board_as_template")}</span>
        </div>
        <form action={formAction} className="flex flex-col gap-3">
          <input
            type="text"
            id="project-id"
            name="project-id"
            defaultValue={project?._id}
            hidden
          />
          <input
            type="text"
            id="board-id"
            name="board-id"
            defaultValue={board?._id}
            hidden
          />
          <div className="flex items-center justify-center flex-col gap-2">
            <input
              type="text"
              id="template-name"
              name="template-name"
              placeholder={t("templates.template_name")}
              required
              className="border-none bg-third border border-third w-full p-2 text-text-color-muted font-medium text-center transition-all duration-150 ease-linear focus:outline-none focus:border-primary focus:shadow-small"
            />
            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id="template-private"
                name="template-private"
                className="w-4 h-4"
                defaultChecked={false}
              />
              <p>{t("templates.share_board_template")}</p>
            </div>
          </div>
          <button
            className="font-bricolage w-full p-2 rounded-sm text-medium"
            disabled={pending}
            data-disabled={pending}
          >
            {t("templates.save_button")}
          </button>
        </form>
      </div>
      <div
        className="modal-layout"
        onClick={(e) => setAddTemplate(false)}
      ></div>
      {popup && (
        <PopupMessage
          status={popup.status}
          title={popup.title}
          message={popup.message}
        />
      )}
    </Portal>
  );
}
