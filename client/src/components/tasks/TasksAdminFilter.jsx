import { useProjectContext } from "@/context/ProjectContext";
import { ChevronDown, CircleUserRound, Undo } from "lucide-react";
import { useState } from "react";
import DisplayPicture from "@/components/User/DisplayPicture";
import { isNotEmpty } from "@/utils/utils";

export default function TasksAdminFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);

  const { project } = useProjectContext();
  const members = project?.members || [];
  const selectedMembers = queries?.responsiblesId || [];

  const hasMembers = queries?.responsiblesId?.length > 0;

  function handleReset() {
    setIsOpen(false);
    setQueries((prev) => ({
      ...prev,
      responsiblesId: null,
    }));
  }

  function handleMemberChange(e) {
    const { value, checked } = e.target;

    if (checked) {
      setQueries((prev) => ({
        ...prev,
        responsiblesId: prev?.responsiblesId
          ? [...prev.responsiblesId, value]
          : [value],
      }));
    } else {
      const deletedResponsible = queries?.responsiblesId?.filter(
        (responsible) => responsible !== value
      );

      setQueries((prev) => ({
        ...prev,
        responsiblesId: deletedResponsible,
      }));
    }
  }

  return (
    <div className="relative">
      <div
        className={`relative flex items-center gap-2 bg-secondary p-2.5 rounded-sm border border-color-border-color cursor-pointer w-[180px] transition-all duration-[120ms] ease-in-out hover:bg-[#f9f7efb3] hover:shadow-small ${
          isOpen ? "bg-[#f9f7efb3] shadow-small" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CircleUserRound size={18} />
        <span className="flex-1 text-[15px]">Responsables</span>
        {hasMembers && (
          <span className="absolute -right-1 -top-1 flex items-center justify-center text-white w-[18px] h-[18px] rounded-full bg-[#CC9348] text-small">
            {selectedMembers?.length}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`transition-all duration-[200ms] ease-in-out ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
      <>
        <div
          className={`absolute z-[2001] top-11 bg-white shadow-small w-full overflow-hidden transition-all duration-[350ms] ease-in-out ${
            isOpen ? "max-h-96" : "max-h-0"
          }`}
        >
          {isNotEmpty(members) ? (
            <ul className="p-2 border border-color-border-color rounded-sm max-h-96 overflow-y-auto">
              <li
                className="flex items-center gap-1 p-1.5 cursor-pointer text-xs font-medium transition-all duration-[120ms] ease-in-out hover:bg-third hover:shadow-small hover:rounded-sm"
                onClick={() => handleReset()}
              >
                <Undo size={16} />
                Supprimer les filtres
              </li>
              {members.map((member) => (
                <li
                  key={member?.user?._id}
                  className="flex items-center gap-1 p-1.5 cursor-pointer text-xs font-medium transition-all duration-[120ms] ease-in-out hover:bg-third hover:shadow-small hover:rounded-sm"
                >
                  <input
                    type="checkbox"
                    id={member?.user?._id}
                    name={member?.user?._id}
                    value={member?.user?._id}
                    onChange={handleMemberChange}
                    checked={
                      hasMembers
                        ? selectedMembers?.includes(member?.user?._id)
                        : false
                    }
                    className="w-auto cursor-pointer mr-1"
                  />

                  <label
                    htmlFor={member?.user?._id}
                    className="flex items-center gap-1 cursor-pointer"
                  >
                    <DisplayPicture
                      user={member?.user}
                      isPopup={false}
                      style={{ width: "22px", height: "22px" }}
                      className="rounded-full"
                    />
                    <span className="whitespace-nowrap text-ellipsis overflow-hidden block max-w-[110px]">
                      {member?.user?.firstName + " " + member?.user?.lastName}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <span className="p-2 border border-color-border-color rounded-sm">
              Aucun membre n'a été trouvé
            </span>
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
