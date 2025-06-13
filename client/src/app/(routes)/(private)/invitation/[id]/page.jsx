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
        const response = await acceptProjectInvitation(id);

        if (!response?.success) {
          if (response?.message === "auth.not_connected") {
            router.push("/");
            return;
          }
          if (response?.message === "auth.user_not_exist") {
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
        console.error(t("common.error"), err);
        router.push("/projects");
      }
    };

    acceptInvitation();
  }, [id, router, t]);

  return <main></main>;
}
