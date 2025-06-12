"use client";
import ProjectTitle from "@/components/Projects/ProjectTitle";
import { UserCog } from "lucide-react";
import { useState } from "react";
import GuestsModal from "@/components/Modals/GuestsModal";
import { isNotEmpty } from "@/utils/utils";
import TasksFilters from "@/components/tasks/TasksFilters";
import DisplayPicture from "@/components/User/DisplayPicture";
import { useProjectContext } from "@/context/ProjectContext";

export default function ProjectHeader({ displayedFilters }) {
  const { project, mutateProject } = useProjectContext();
  const [isOpen, setIsOpen] = useState(false);
  const members = project?.members;

  return (
    <>
      <header className="w-full pr-6">
        <nav className="flex items-center justify-between pb-4">
          <ProjectTitle project={project} />
          <TasksFilters displayedFilters={displayedFilters} />
          <div className="flex">
            <div className="flex justify-center items-center ml-2.5">
              {isNotEmpty(members) &&
                members?.map((member) => (
                  <div
                    key={member?.user?._id}
                    className="-ml-2 rounded-full transition-transform duration-200 hover:-translate-y-0.5"
                  >
                    <DisplayPicture
                      user={member?.user}
                      style={{ width: "32px", height: "32px" }}
                      className="mt-[5px] rounded-full object-cover max-w-[32px] max-h-[32px]"
                    />
                  </div>
                ))}
            </div>
            <div
              className="flex justify-center items-center cursor-pointer rounded-lg py-1.5 px-[7px] transition-all duration-200 ease-in-out hover:text-accent-color hover:bg-white/3"
              onClick={(e) => setIsOpen(true)}
            >
              <UserCog size={24} />
            </div>
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
