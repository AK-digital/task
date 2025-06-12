"use client";
import { acceptProjectInvitation } from "@/actions/project";
import socket from "@/utils/socket";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Invitation() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    const acceptInvitation = async () => {
      try {
        const response = await acceptProjectInvitation(id, t);

        if (!response?.success) {
          if (response?.message === t("auth.not_connected")) {
            router.push("/");
            return;
          }
          if (response?.message === t("auth.user_not_exist")) {
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
