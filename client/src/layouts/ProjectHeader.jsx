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
        <nav className="flex items-center gap-5 pb-4 ">
          <ProjectTitle project={project} />
          <TasksFilters displayedFilters={displayedFilters} />
            <div
              className='secondary-button'
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
