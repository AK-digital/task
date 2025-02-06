"use client";

import { useParams } from "next/navigation";

export default function Invitation() {
  const { id } = useParams();
  console.log(id);
  //   const { data, isLoading } = useSWR();

  return <main>hey</main>;
}
