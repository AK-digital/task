"use client";
import { acceptProjectInvitation } from "@/actions/project";
import socket from "@/utils/socket";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Invitation() {
  const { id } = useParams();
  const router = useRouter();

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
          socket.emit("accept project invitation", project?._id);
          router.push(`/projects/${project?._id}`);
        }
      } catch (err) {
        console.error("Erreur lors de l'acceptation de l'invitation :", err);
        router.push("/projects");
      }
    };

    acceptInvitation();
  }, [id, router]);

  return <main></main>;
}
