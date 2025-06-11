"use client";
import ProjectHeader from "@/layouts/ProjectHeader";
import Boards from "@/components/Boards/Boards";
import { useEffect } from "react";
import socket from "@/utils/socket";
import { useProjectContext } from "@/context/ProjectContext";
import { useProjectInvitation } from "@/app/hooks/useProjectInvitation";
import { useRouter } from "next/navigation";
import { useFavorites } from "@/app/hooks/useFavorites";

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
  const { favoritesMutate } = useFavorites();

  useEffect(() => {
    function handleProjectRevalidate() {
      mutateProject(undefined, { revalidate: true });
      favoritesMutate();
    }

    function handleInvitationRevalidate() {
      mutateProject(undefined, { revalidate: true });
      mutateProjectInvitation(undefined, { revalidate: true });
    }

    function handleInvitationRoleUpdate(roleData) {
      const { invitationId, newRole } = roleData || {};

      if (!invitationId || !newRole) return;

      mutateProjectInvitation(
        (currentInvitations) =>
          currentInvitations?.map((invitation) =>
            invitation._id === invitationId
              ? { ...invitation, role: newRole }
              : invitation
          ),
        { revalidate: false }
      );
    }

    function handleRedirect() {
      router.push("/projects");
    }

    socket.on("project-updated", handleProjectRevalidate);
    socket.on("project-invitation-updated", handleInvitationRevalidate);
    socket.on("project-invitation-role-updated", handleInvitationRoleUpdate);
    socket.on("project-redirected", handleRedirect);
    socket.on("user picture updated", handleProjectRevalidate);

    return () => {
      socket.off("project-updated", handleProjectRevalidate);
      socket.off("project-invitation-updated", handleInvitationRevalidate);
      socket.off("project-invitation-role-updated", handleInvitationRoleUpdate);
      socket.off("project-redirected", handleRedirect);
      socket.off("user picture updated", handleProjectRevalidate);
    };
  }, [mutateProject, mutateProjectInvitation, router, favoritesMutate]);

  return (
    <div className="flex flex-col bg-[#dad6c799] min-h-full h-full rounded-tl-2xl pt-6 pl-6 pr-3 pb-0">
      <ProjectHeader displayedFilters={displayedFilters} />
      <Boards boards={boards} tasksData={tasks} />
    </div>
  );
}
