import { updateBoardTemplateVisibility } from "@/api/boardTemplate";
import { LockKeyhole, Settings, Users, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

export default function DropdownManageTemplate({
  handleDeleteBoardTemplate,
  mutatePrivateBoardTemplates,
  mutatePublicBoardTemplates,
  template,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const handleIsOpen = () => {
    if (!isOpen && buttonRef.current) {
      // Calculer la position du dropdown avant de l'ouvrir
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 200; // Hauteur approximative du dropdown
      const viewportHeight = window.innerHeight;
      
      // Vérifier s'il y a assez d'espace en bas
      const spaceBelow = viewportHeight - rect.bottom;
      const shouldOpenUpward = spaceBelow < dropdownHeight;
      
      setDropdownPosition({
        top: shouldOpenUpward ? rect.top - dropdownHeight : rect.bottom,
        left: rect.left,
        width: rect.width,
        openUpward: shouldOpenUpward
      });
    }
    setIsOpen((prev) => !prev);
  };


  async function handleVisibility() {
    const response = await updateBoardTemplateVisibility(template?._id);

    if (!response.success) {
      return;
    }

    mutatePrivateBoardTemplates();
    mutatePublicBoardTemplates();
  }

  // Contenu du dropdown
  const dropdownContent = (
    <div
      className="bg-secondary text-small rounded-sm overflow-hidden text-left shadow-medium border border-color-border-color"
      style={{
        position: 'fixed',
        top: dropdownPosition.top,
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        zIndex: 9999,
        maxHeight: '200px'
      }}
    >
      <ul className="flex justify-center items-center flex-col gap-0 w-full max-h-[200px] overflow-y-auto">
        {template.private ? (
          <li className="w-full">
            <button
              onClick={handleVisibility}
              className="group flex justify-start items-center gap-[10px] text-text-color-muted py-2 px-[5px] bg-transparent rounded-none w-full text-small hover:bg-third group-hover:text-text-dark-color"
            >
              <Users
                size={16}
                className="transition-all duration-200 text-text-color-muted group-hover:text-text-dark-color"
              />
              <span className="text-small group-hover:text-text-dark-color">
                Rendre public
              </span>
            </button>
          </li>
        ) : (
          <li className="w-full">
            <button
              onClick={handleVisibility}
              className="group flex justify-start items-center gap-[10px] text-text-color-muted py-2 px-[5px] bg-transparent rounded-none w-full text-small hover:bg-third group-hover:text-text-dark-color"
            >
              <LockKeyhole
                size={16}
                className="transition-all duration-200 text-text-color-muted group-hover:text-text-dark-color"
              />
              <span className="text-small group-hover:text-text-dark-color">
                Rendre privé
              </span>
            </button>
          </li>
        )}
        <li className="w-full">
          <button
            type="button"
            onClick={(e) => handleDeleteBoardTemplate(e, template?._id)}
            className="group flex justify-start items-center gap-[10px] text-text-color-muted py-2 px-[5px] bg-transparent rounded-none w-full hover:bg-third group-hover:text-text-dark-color"
          >
            <X
              size={16}
              className="transition-all duration-200 text-text-color-red/80  group-hover:text-text-color-red"
            />
            <span className="text-small text-text-color-red/80 group-hover:text-text-color-red">
              Supprimer
            </span>
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <>
      <div className="relative text-center text-text-color-muted select-none data-[active=true]:z-9999 !gap-0">
        <button
          ref={buttonRef}
          onClick={handleIsOpen}
          className="relative flex justify-center items-center gap-[5px] bg-color-medium-color rounded-sm text-sm px-5 py-[5px] hover:bg-color-medium-color/80"
        >
          <Settings size={16} />
          <span>Gérer</span>
        </button>

        {isOpen && (
          <>
            <div className="modal-layout-opacity" onClick={handleIsOpen}></div>
            {typeof document !== 'undefined' && 
              createPortal(dropdownContent, document.body)
            }
          </>
        )}
      </div>
    </>
  );
}
