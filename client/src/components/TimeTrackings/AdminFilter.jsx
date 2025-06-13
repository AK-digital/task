import React, { useEffect, useState } from "react";
import DisplayPicture from "../User/DisplayPicture";
import { ChevronDownIcon, ChevronUpIcon, Undo } from "lucide-react";

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
        className="relative flex items-center justify-center gap-1 p-2.5 rounded-sm bg-secondary cursor-pointer text-medium w-[180px] max-h-10 border border-color-border-color"
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
          <span className="flex justify-center gap-1 text-[15px]">
            Tous les membres
          </span>
        )}
        {!isOpen && (
          <ChevronDownIcon size={16} className="absolute right-1.5" />
        )}
        {isOpen && <ChevronUpIcon size={16} className="absolute right-1.5" />}
      </div>
      <div
        className={`absolute top-[calc(100%+4px)] left-0 w-full bg-secondary shadow-medium rounded-lg z-[2000] overflow-hidden transition-all duration-[350ms] ease-in-out  ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <ul className="max-h-96 overflow-y-auto p-1.5 [&>li]:hover:rounded-sm [&>li]:hover:shadow-small [&>li]:hover:bg-third">
          <li
            className="flex items-center p-1.5 text-xs gap-1 cursor-pointer"
            onClick={handleReset}
          >
            <Undo size={16} />
            Supprimer les filtres
          </li>
          {members?.map((member) => {
            return (
              <li
                key={member?.user?._id}
                className="flex items-center p-1.5 text-xs gap-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  id={`user-${member?.user?._id}`}
                  name="user"
                  onChange={(e) => handleMemberChange(e, member)}
                  value={member?.user?._id}
                  checked={Boolean(
                    queries?.members?.includes(member?.user?._id)
                  )}
                  className="max-w-4 max-h-4 cursor-pointer"
                />
                <label
                  htmlFor={`user-${member?.user?._id}`}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <DisplayPicture
                    user={member?.user}
                    style={{ width: "22px", height: "22px" }}
                    className="rounded-full"
                  />
                  <span className="block text-ellipsis overflow-hidden whitespace-nowrap max-w-25">
                    {member?.user?.firstName} {member?.user?.lastName}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
