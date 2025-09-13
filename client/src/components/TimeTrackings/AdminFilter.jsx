import React, { useEffect, useState } from "react";
import DisplayPicture from "../User/DisplayPicture";
import { ChevronDownIcon, ChevronUpIcon, Undo } from "lucide-react";
import Checkbox from "../UI/Checkbox";

export default function AdminFilter({ projects, queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [members, setMembers] = useState([]);

  const hasMembers = currentMembers?.length > 0;

  function uniqueProjectMembers(arr) {
    return arr?.reduce((acc, member) => {
      if (!acc.find((m) => m?.user?._id === member?.user?._id)) {
        acc.push(member);
      }
      return acc;
    }, []);
  }

  useEffect(() => {
    if (queries?.projects?.length === 0 || !queries?.projects) {
      const projectMembers = projects?.map((p) => p?.members).flat();
      const uniqueMembers = uniqueProjectMembers(projectMembers);

      setMembers(uniqueMembers);
    } else {
      const selectedProjects = projects?.filter((p) =>
        queries?.projects?.includes(p?._id)
      );

      const selectedProjectsMembers = selectedProjects
        ?.map((p) => p?.members)
        .flat();

      const uniqueSelectedMembers = uniqueProjectMembers(
        selectedProjectsMembers
      );
      setMembers(uniqueSelectedMembers || []);
    }
  }, [projects, queries]);

  function handleMemberChange(e, member) {
    const isChecked = e.target.checked;

    if (isChecked) {
      const newCurrentMembers = [...currentMembers, member];
      setCurrentMembers(newCurrentMembers);

      const newMemberIds = newCurrentMembers.map((m) => m?.user?._id);
      setQueries({ ...queries, members: newMemberIds });
    } else {
      const newCurrentMembers = currentMembers.filter(
        (m) => m?.user?._id !== member?.user?._id
      );
      setCurrentMembers(newCurrentMembers);

      const newMemberIds = newCurrentMembers.map((m) => m?.user?._id);
      setQueries({ ...queries, members: newMemberIds });
    }
  }

  function handleReset() {
    setCurrentMembers([]);
    setQueries({ ...queries, members: undefined });
  }

  return (
    <div className="relative select-none">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="secondary-button"
        data-open={isOpen}
      >
        {hasMembers ? (
          <>
            <span className="flex justify-center gap-1">
              {currentMembers?.slice(0, 3)?.map((m) => {
                return (
                  <React.Fragment key={m?.user?._id}>
                    <DisplayPicture
                      user={m?.user}
                      style={{ width: "24px", height: "24px" }}
                      className="rounded-full"
                      isPopup={false}
                    />
                  </React.Fragment>
                );
              })}
              {currentMembers?.length > 3 && (
                <span className="text-xs font-bold text-text-dark-color bg-primary rounded-full w-6 h-6 flex items-center justify-center">
                  +{currentMembers?.length - 3}
                </span>
              )}
            </span>
          </>
        ) : (
          <span className="flex justify-center gap-1 text-[14px]">
            Tous les membres
          </span>
        )}
        {hasMembers && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center text-white w-[18px] h-[18px] rounded-full bg-accent-color text-small">
            {currentMembers?.length}
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
          className={`absolute z-[2001] top-[44px] bg-white shadow-small w-full font-medium text-small overflow-hidden transition-all duration-[350ms] ease-in-out ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          {isOpen && (
            <ul className="flex flex-col p-2 border border-color-border-color rounded-sm max-h-96 overflow-y-auto">
              <li
                className="flex items-center gap-2 h-[30px] pl-2 cursor-pointer text-xs hover:bg-third hover:shadow-small hover:rounded-sm"
                onClick={handleReset}
              >
                <Undo size={14} />
                <span>Effacer</span>
              </li>
              {members?.map((member) => {
                return (
                  <li
                    key={member?.user?._id}
                    className="flex items-center gap-2 h-[30px] pl-2 cursor-pointer hover:bg-third text-xs hover:shadow-small hover:rounded-sm"
                  >
                    <Checkbox
                      id={`user-${member?.user?._id}`}
                      name="user"
                      onChange={(e) => handleMemberChange(e, member)}
                      value={member?.user?._id}
                      checked={Boolean(
                        queries?.members?.includes(member?.user?._id)
                      )}
                    />
                    <label
                      htmlFor={`user-${member?.user?._id}`}
                      className="flex items-center gap-1 cursor-pointer"
                    >
                      <DisplayPicture
                        user={member?.user}
                        style={{ width: "22px", height: "22px" }}
                        className="rounded-full"
                        isPopup={false}
                      />
                      <span className="block text-ellipsis overflow-hidden whitespace-nowrap max-w-25">
                        {member?.user?.firstName} {member?.user?.lastName}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
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
