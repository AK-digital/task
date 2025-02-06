"use client";
import { acceptProjectInvitation } from "@/actions/project";
import { useParams } from "next/navigation";
import useSWR from "swr";

export default function Invitation() {
  const { id } = useParams();
  console.log(id);
  const { data, isLoading } = useSWR("/project/accept-invitation", () =>
    acceptProjectInvitation(id)
  );

  console.log(data);

  return (
    <main>
      <div>
        <h1></h1>
      </div>
      {!data?.success && (
        <div>
          <p>{data?.message}</p>
        </div>
      )}
      <div>{/* <p>{data}</p> */}</div>
    </main>
  );
}
