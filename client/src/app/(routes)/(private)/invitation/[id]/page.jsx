"use client";
import { acceptProjectInvitation } from "@/actions/project";
import { deleteCookie } from "cookies-next";
import { setCookie } from "cookies-next/client";
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
            setCookie("invitationId", id);
            router.push("/");
            return;
          }
          router.push("/projects");
        } else {
          const project = response?.data;
          deleteCookie("invitationId");
          router.push(`/project/${project?._id}`);
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
