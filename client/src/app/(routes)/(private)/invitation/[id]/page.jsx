"use client";
import { acceptProjectInvitation } from "@/actions/project";
import { deleteCookie } from "cookies-next";
import { setCookie } from "cookies-next/client";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

export default function Invitation() {
  const { id } = useParams();
  const router = useRouter();

  useSWR("/project/accept-invitation", () => acceptProjectInvitation(id), {
    onSuccess: (data) => {
      if (!data?.success) {
        if (data?.message === "L'utilisateur n'est pas connecté") {
          setCookie("invitationId", id);
          return;
        }
      } else {
        const project = data?.data;
        deleteCookie("invitationId");
        router.push(`/project/${project?._id}`);
      }
    },
  });

  return <main></main>;
}
