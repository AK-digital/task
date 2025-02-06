"use client";

import { useParams } from "next/navigation";

export default function Invitation() {
  const params = useParams();
  console.log(params);
  //   const { data, isLoading } = useSWR();

  return <main>hey</main>;
}
