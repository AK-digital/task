"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import Boards from "@/components/Boards/Boards";
import ProjectTimeTrackings from "@/components/TimeTrackings/ProjectTimeTrackings";
import { useEffect, useState } from "react";
import socket from "@/utils/socket";
import { useProjectContext } from "@/context/ProjectContext";
import { useViewContext } from "@/context/ViewContext";

const displayedFilters = {
  isSearch: true,
  isProject: false,
  isBoard: false,
  isAdmin: true,
  isStatus: true,
  isPriorities: true,
  isDeadline: true,
};

export default function Project() {
  const { boards, tasks, mutateProject, project } = useProjectContext();
  const { currentView } = useViewContext();
  const [timeQueries, setTimeQueries] = useState({
    projects: [project?._id], // Filtrer uniquement sur le projet actuel
  });

  useEffect(() => {
    function handleRevalidate() {
      mutateProject();
    }

    socket.on("accepted project invitation", handleRevalidate);

    return () => {
      socket.off("accepted project invitation");
    };
  }, [socket]);

  // Mettre à jour les queries quand le projet change
  useEffect(() => {
    if (project?._id) {
      setTimeQueries(prev => ({ ...prev, projects: [project._id] }));
    }
  }, [project?._id]);

  return (
    <div className="flex flex-col bg-[#dad6c799] min-h-full h-full rounded-tl-2xl pt-6 pl-6 pr-3 pb-0">
      <ProjectHeader 
        displayedFilters={displayedFilters}
        timeQueries={timeQueries}
        setTimeQueries={setTimeQueries}
      />
      
      {/* Container with transition animation */}
      <div className="relative flex-1 overflow-hidden">
        <div
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            currentView === 'tasks' 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 -translate-x-full pointer-events-none'
          }`}
        >
          <Boards boards={boards} tasksData={tasks} />
        </div>
        
        <div
          className={`absolute inset-0 transition-all duration-300 ease-in-out ${
            currentView === 'time' 
              ? 'opacity-100 translate-x-0' 
              : 'opacity-0 translate-x-full pointer-events-none'
          }`}
        >
          <ProjectTimeTrackings timeQueries={timeQueries} setTimeQueries={setTimeQueries} />
        </div>
      </div>
    </div>
  );
}
