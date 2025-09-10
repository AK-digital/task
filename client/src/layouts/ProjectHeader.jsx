"use client";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import { UserCog } from "lucide-react";
import { useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import TasksFilters from "@/components/tasks/TasksFilters";
import { useProjectContext } from "@/context/ProjectContext";

export default function ProjectHeader({ displayedFilters }) {
  const { project, mutateProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const members = project?.members || [];

  return (
    <>
      <header className="w-full pr-6">
        <nav className="flex items-center gap-4 pb-4 ">
          <ProjectTitle project={project} />
          <TasksFilters displayedFilters={displayedFilters} />
            <div
              className={`flex items-center cursor-pointer rounded-md py-2 px-3 gap-2 border transition-all duration-200 ease-in-out ${
                isOpen 
                  ? 'bg-accent-color/10 border-accent-color/30 text-accent-color' 
                  : 'border-color-border-color hover:border-accent-color/50 hover:bg-accent-color/5 hover:text-accent-color'
              }`}
              onClick={(e) => setIsOpen(true)}
              title={`Gérer les ${members.length} membre${members.length > 1 ? 's' : ''} de l'équipe`}
          >
            <UserCog size={20} />
            <span className="text-sm font-medium whitespace-nowrap">
              Membres
            </span>
            <span className="text-xs bg-secondary text-gray-600 px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {members.length}
            </span>
            </div>
        </nav>
      </header>
      {isOpen && (
        <GuestsModal
          project={project}
          setIsOpen={setIsOpen}
          mutateProject={mutateProject}
        />
      )}
    </>
  );
}
