"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { useProjectContext } from "@/context/ProjectContext";
import { useProjectInvitation } from "@/app/hooks/useProjectInvitation";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  useEffect(() => {
    function handleRevalidate() {
      mutateProject(undefined, { revalidate: true });
      mutateProjectInvitation();
    }

    function handleRedirect() {
      router.push("/projects");
    }

    socket.on("project-updated", handleRevalidate);
    socket.on("project-invitation-updated", handleRevalidate);
    socket.on("project-redirected", handleRedirect);

    return () => {
      socket.off("project-updated");
      socket.off("project-invitation-updated");
      socket.off("project-redirected");
    };
  }, [socket, mutateProject, mutateProjectInvitation, router]);

  return (
    <div className="flex flex-col bg-[#dad6c799] min-h-full h-full rounded-tl-2xl pt-6 pl-6 pr-3 pb-0">
      <ProjectHeader displayedFilters={displayedFilters} />
      <Boards boards={boards} tasksData={tasks} />
    </div>
  );
}
