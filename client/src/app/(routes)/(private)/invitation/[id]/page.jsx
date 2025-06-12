"use client";
import { acceptProjectInvitation } from "@/actions/project";
import socket from "@/utils/socket";
import { AuthContext } from "@/context/auth";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useContext } from "react";

export default function Invitation() {
  const { id } = useParams();
  const router = useRouter();
  const { uid } = useContext(AuthContext);

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        const response = await acceptProjectInvitation(id);

        if (!response?.success) {
          if (response?.message === "L'utilisateur n'est pas connecté") {
            router.push("/");
            return;
          }
          if (response?.message === "L'utilisateur n'existe pas") {
            router.push("/sign-up");
            return;
          }
          router.push("/projects");
        } else {
          const project = response?.data;

          if (uid) {
            socket.emit("refresh-project-rooms", uid);
          }

          socket.emit("update-project-invitation", project?._id);
          router.push(`/projects/${project?._id}`);
        }
      } catch (err) {
        console.error("Erreur lors de l'acceptation de l'invitation :", err);
        router.push("/projects");
      }
    };

    acceptInvitation();
  }, [id, router, uid]);

  return <main></main>;
}
