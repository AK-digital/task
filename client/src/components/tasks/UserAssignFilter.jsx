import React, { useEffect, useState } from "react";
import DisplayPicture from "../User/DisplayPicture";
import { ChevronDownIcon, UserPlus, Undo } from "lucide-react";
import Checkbox from "../UI/Checkbox";

export default function UserAssignFilter({ project, onAssign }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [members, setMembers] = useState([]);

  const hasSelectedUsers = selectedUsers?.length > 0;

  useEffect(() => {
    // Récupérer les membres du projet
    if (project?.members) {
      setMembers(project.members);
    }
  }, [project]);

  function handleUserChange(e, member) {
    const isChecked = e.target.checked;

    if (isChecked) {
      const newSelectedUsers = [...selectedUsers, member];
      setSelectedUsers(newSelectedUsers);
    } else {
      const newSelectedUsers = selectedUsers.filter(
        (u) => u?.user?._id !== member?.user?._id
      );
      setSelectedUsers(newSelectedUsers);
    }
  }

  function handleReset() {
    setSelectedUsers([]);
  }

  function handleAssign() {
    if (selectedUsers.length > 0) {
      const userIds = selectedUsers.map(u => u?.user?._id);
      onAssign(userIds);
      setSelectedUsers([]);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative select-none">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="secondary-button"
        data-open={isOpen}
      >
        <UserPlus size={16} />
        <span className="text-sm">Attribuer</span>
        {hasSelectedUsers && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center text-white w-[18px] h-[18px] rounded-full bg-accent-color text-small">
            {selectedUsers?.length}
          </span>
        )}
        <ChevronDownIcon
          size={16}
          className={`transition-all duration-[200ms] ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <>
        <div
          className={`absolute z-[2001] bottom-[44px] shadow-small w-64 font-medium text-small overflow-hidden transition-all duration-[350ms] ease-in-out ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          {isOpen && (
            <div className="flex flex-col border border-[#e0e0e0] bg-secondary rounded-sm">
              {/* Header avec utilisateurs sélectionnés */}
              {hasSelectedUsers && (
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-600">
                      Utilisateurs sélectionnés:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedUsers.map((member) => (
                      <div
                        key={member?.user?._id}
                        className="flex items-center gap-1 bg-accent-color/10 text-accent-color px-2 py-1 rounded text-xs"
                      >
                        <DisplayPicture
                          user={member?.user}
                          style={{ width: "16px", height: "16px" }}
                          className="rounded-full"
                          isPopup={false}
                        />
                        <span>
                          {member?.user?.firstName} {member?.user?.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Liste des membres */}
              <ul className="flex flex-col pl-2 pt-2 pr-4 pb-2 max-h-64 overflow-y-auto">
                <li
                  className="flex items-center gap-2 h-[30px] pl-1 py-0.5 cursor-pointer text-xs hover:bg-third hover:shadow-small hover:rounded-sm"
                  onClick={handleReset}
                >
                  <Undo size={14} />
                  <span>Effacer</span>
                </li>
                {members?.map((member) => {
                  const isSelected = selectedUsers.some(u => u?.user?._id === member?.user?._id);
                  return (
                    <li
                      key={member?.user?._id}
                      className="flex items-center gap-2 h-[30px] pl-1 py-0.5 cursor-pointer hover:bg-third text-xs hover:shadow-small hover:rounded-sm"
                    >
                      <Checkbox
                        id={`assign-user-${member?.user?._id}`}
                        name="assign-user"
                        onChange={(e) => handleUserChange(e, member)}
                        value={member?.user?._id}
                        checked={isSelected}
                      />
                      <label
                        htmlFor={`assign-user-${member?.user?._id}`}
                        className="flex items-center gap-1 cursor-pointer flex-1"
                      >
                        <DisplayPicture
                          user={member?.user}
                          style={{ width: "22px", height: "22px" }}
                          className="rounded-full"
                          isPopup={false}
                        />
                        <span className="block text-ellipsis overflow-hidden whitespace-nowrap">
                          {member?.user?.firstName} {member?.user?.lastName}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>

              {/* Boutons d'action */}
              {hasSelectedUsers && (
                <div className="p-3 border-t border-gray-200">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAssign}
                      className="flex-1 bg-accent-color text-white px-3 py-2 rounded text-xs font-medium hover:bg-accent-color-dark transition-colors"
                    >
                      Attribuer ({selectedUsers.length})
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-3 py-2 border border-gray-300 rounded text-xs hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {isOpen && (
          <div
            className="modal-layout-opacity"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
      </>
    </div>
  );
}
