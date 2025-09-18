import { updateBoardTemplateVisibility } from "@/api/boardTemplate";
import { LockKeyhole, Settings, Users, X } from "lucide-react";
import React, { useState } from "react";

export default function DropdownManageTemplate({
  handleDeleteBoardTemplate,
  mutatePrivateBoardTemplates,
  mutatePublicBoardTemplates,
  template,
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleIsOpen = () => {
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

  return (
    <>
      <div className="relative text-center text-text-color-muted select-none data-[active=true]:z-9999 !gap-0">
        <button
          onClick={handleIsOpen}
          className="relative flex justify-center items-center gap-[5px] h-8 bg-color-medium-color rounded-sm text-small w-32 hover:bg-color-medium-color/80"
        >
          <Settings size={16} />
          <span>Gérer</span>
        </button>
        <div
          className={`absolute z-9999 top-10 left-0 w-full bg-secondary text-small rounded-sm overflow-hidden text-left shadow-medium transition-all duration-[350ms] ease-in-out ${
            isOpen ? "max-h-[200px]" : "max-h-0"
          }`}
        >
          <ul className="flex justify-center items-center flex-col gap-0 w-full border border-color-border-color rounded-sm max-h-[200px] overflow-y-auto">
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

        {isOpen && (
          <div className="modal-layout-opacity" onClick={handleIsOpen}></div>
        )}
      </div>
    </>
  );
}
