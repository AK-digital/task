"use client";

export default function ConfirmationKick({ onCancel, onConfirm }) {
  return (
    <div className="fixed flex justify-center items-center inset-0 bg-black/50 z-3001">
      <div className="flex flex-col gap-6 bg-white rounded-lg p-6 w-[90%] max-w-[500px] shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
        <h3 className="text-center mt-0 text-large text-text-dark-color">
          Confirmation de suppression
        </h3>
        <p className="text-text-medium-color">
          Êtes-vous sûr de vouloir supprimer le membre {} du projet {} ? Cette
          action est irréversible.
        </p>
        <div className="flex justify-between gap-3">
          <button
            className="py-2 px-4 cursor-pointer hover:bg-accent-color-hover"
            onClick={onCancel}
          >
            Annuler
          </button>
          <button
            className="border-none bg-danger-color py-2 px-4 rounded-sm hover:bg-[#c0392b]"
            onClick={onConfirm}
          >
            Confirmer la suppresion
          </button>
        </div>
      </div>
    </div>
  );
}
