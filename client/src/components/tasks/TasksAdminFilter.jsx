import { useProjectContext } from "@/context/ProjectContext";
import { Undo } from "lucide-react";
import DisplayPicture from "@/components/User/DisplayPicture";
import { isNotEmpty } from "@/utils/utils";

export default function TasksAdminFilter({ queries, setQueries }) {
  const { project } = useProjectContext();
  const members = project?.members || [];
  const selectedMembers = queries?.responsiblesId || [];
  const hasMembers = queries?.responsiblesId?.length > 0;

  function handleReset() {
    setQueries((prev) => ({
      ...prev,
      responsiblesId: null,
    }));
  }

  function handleMemberClick(memberId) {
    const isSelected = selectedMembers.includes(memberId);
    
    if (isSelected) {
      // Retirer le membre de la sélection
      const updatedMembers = selectedMembers.filter(id => id !== memberId);
      setQueries((prev) => ({
        ...prev,
        responsiblesId: updatedMembers.length > 0 ? updatedMembers : null,
      }));
    } else {
      // Ajouter le membre à la sélection
      setQueries((prev) => ({
        ...prev,
        responsiblesId: [...selectedMembers, memberId],
      }));
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center ml-2.5">
        {isNotEmpty(members) &&
          members?.map((member) => {
            const isSelected = selectedMembers.includes(member?.user?._id);
            return (
              <div
                key={member?.user?._id}
                className={`-ml-2 rounded-full transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative ${
                  isSelected ? 'ring-2 ring-[#CC9348] ring-offset-2' : ''
                }`}
                onClick={() => handleMemberClick(member?.user?._id)}
                title={`${member?.user?.firstName} ${member?.user?.lastName}${isSelected ? ' (sélectionné)' : ''}`}
              >
                <DisplayPicture
                  user={member?.user}
                  style={{ width: "32px", height: "32px" }}
                  className="mt-[5px] rounded-full object-cover max-w-[32px] max-h-[32px]"
                />
                {isSelected && (
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-[#CC9348] rounded-full border-2 border-white"></div>
                )}
              </div>
            );
          })}
      </div>
      
      {hasMembers && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2 py-1 text-[13px] text-gray-600 hover:text-[#CC9348] transition-colors duration-200 ml-2"
          title="Réinitialiser le filtre"
        >
          <Undo size={14} />
          Réinitialiser
        </button>
      )}
    </div>
  );
}
