"use client";
import { acceptProjectInvitation } from "@/actions/project";
import { AuthContext } from "@/context/auth";
import { setCookie } from "cookies-next/client";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import useSWR from "swr";

export default function Invitation() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const router = useRouter();
  console.log(user);

  useEffect(() => {
    if (!user) {
      setCookie("invitationId", id);
    }
  }, [user]);

  console.log(id);
  const { data } = useSWR(
    "/project/accept-invitation",
    () => acceptProjectInvitation(id),
    {
      onSuccess: (data) => {
        if (!data?.success) {
          console.log("failed");
        } else {
          const project = data?.data;
          router.push(`/project/${project?._id}`);
        }
      },
    }
  );

  return <main>{user}</main>;
}
