"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { useProjectContext } from "@/context/ProjectContext";
import { useProjectInvitation } from "@/app/hooks/useProjectInvitation";

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
  const { mutateProjectInvitation } = useProjectInvitation(project?._id);

  useEffect(() => {
    function handleRevalidate() {
      mutateProject(undefined, { revalidate: true });
      mutateProjectInvitation();
    }

    socket.on("project-updated", handleRevalidate);
    socket.on("project-invitation-updated", handleRevalidate);

    return () => {
      socket.off("project-updated");
      socket.off("project-invitation-updated");
    };
  }, [socket, mutateProject, mutateProjectInvitation]);

  return (
    <div className="flex flex-col bg-[#dad6c799] min-h-full h-full rounded-tl-2xl pt-6 pl-6 pr-3 pb-0">
      <ProjectHeader displayedFilters={displayedFilters} />
      <Boards boards={boards} tasksData={tasks} />
    </div>
  );
}
