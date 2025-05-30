"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { useProjectContext } from "@/context/ProjectContext";

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
  const { boards, tasks, mutateProject } = useProjectContext();

  useEffect(() => {
    function handleRevalidate() {
      mutateProject();
    }

    socket.on("accepted project invitation", handleRevalidate);

    return () => {
      socket.off("accepted project invitation");
    };
  }, [socket]);

  return (
    <div className="flex flex-col bg-[#dad6c799] min-h-full h-full rounded-tl-border-radius-medium pt-6 pl-6 pr-3 pb-0">
      <ProjectHeader displayedFilters={displayedFilters} />
      <Boards boards={boards} tasksData={tasks} />
    </div>
  );
}
