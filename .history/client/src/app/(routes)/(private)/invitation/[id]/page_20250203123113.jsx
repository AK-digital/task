"use client";
import { acceptProjectInvitation } from "@/actions/project";
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
        console.log(data?.message);
      } else {
        const project = data?.data;
        router.push(`/project/${project?._id}`);
      }
    },
  });

  return <main></main>;
}
