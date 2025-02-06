"use client";
import { acceptProjectInvitation } from "@/actions/project";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";

export default function Invitation() {
  const { id } = useParams();
  const router = useRouter();
  console.log(id);
  const { data } = useSWR(
    "/project/accept-invitation",
    () => acceptProjectInvitation(id),
    {
      onSuccess: (data) => {
        if (!data?.success) {
          console.log("failed");
        } else {
        }
      },
    }
  );

  return (
    <main>
      {!data?.success && (
        <div>
          <h1>Impossible d'accepter l'invitation</h1>
          <p>Une erreur s'est produite lors de l'acceptation de l'invitation</p>
        </div>
      )}
    </main>
  );
}
