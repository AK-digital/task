"use client";
import { useTranslation } from "react-i18next";

export default function ConfirmationDelete({ title, onCancel, onConfirm }) {
  const { t } = useTranslation();

  return (
    <div className="fixed flex justify-center items-center inset-0 bg-black/50 z-3001">
      <div className="flex flex-col gap-6 bg-white rounded-lg p-6 w-[90%] max-w-[500px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
        <h3 className="text-center mt-0 text-large text-text-dark-color">
          {t("general.confirm_deletion")}
        </h3>
        <p className="text-text-medium-color">
          {t("general.confirm_deletion_message", { title })}
        </p>
        <div className="flex justify-between gap-3">
          <button
            className="py-2 px-4 cursor-pointer hover:bg-accent-color-hover"
            onClick={onCancel}
          >
            {t("general.cancel")}
          </button>
          <button
            className="border-none bg-danger-color py-2 px-4 rounded-sm hover:bg-[#c0392b]"
            onClick={onConfirm}
          >
            {t("general.confirm_delete_button")}
          </button>
        </div>
      </div>
    </div>
  );
}
