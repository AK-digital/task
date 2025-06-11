import { useTranslation } from "react-i18next";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, message }) {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="relative">
      <div className="absolute bg-secondary rounded-lg shadow-medium z-2002 right-[29px] -top-[50px] min-w-50">
        <div className="absolute top-[49%] right-0 w-2.5 h-2.5 bg-secondary rotate-45 -translate-y-1/2"></div>
        <div className="p-3">
          <p className="text-[0.85em] text-center select-none">{message}</p>
          <span className="text-[0.7rem] text-[#8688a4] text-center w-full block select-none">
            {t("general.irreversible_action")}
          </span>
          <div className="flex justify-between gap-2 mt-2.5">
            <button
              onClick={onClose}
              className="bg-text-color-muted py-2 px-[22px] border-none rounded-lg cursor-pointer"
            >
              {t("general.no")}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="bg-danger-color text-white py-2 px-[22px] border-none rounded-lg cursor-pointer"
            >
              {t("general.yes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
