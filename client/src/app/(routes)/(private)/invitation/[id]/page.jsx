"use client";
import { acceptProjectInvitation } from "@/actions/project";
import { deleteCookie } from "cookies-next";
import { setCookie } from "cookies-next/client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

export default function Invitation() {
  const { id } = useParams();
  const router = useRouter();

  const { data } = useSWR("/project/accept-invitation", () =>
    acceptProjectInvitation(id)
  );

  useEffect(() => {
    if (!data?.success) {
      if (data?.message === "L'utilisateur n'est pas connecté") {
        setCookie("invitationId", id);
        return;
      }
      router.push("/projects");
    } else {
      const project = data?.data;
      deleteCookie("invitationId");
      router.push(`/project/${project?._id}`);
    }
  }, [data, router]);

  return <main></main>;
}
