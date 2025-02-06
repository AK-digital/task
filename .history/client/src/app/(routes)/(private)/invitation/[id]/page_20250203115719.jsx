"use client";

import { useParams } from "next/navigation";

export default function Invitation({ params }) {
  const params = useParams();
  console.log(params);
  //   const { data, isLoading } = useSWR();

  return <main>hey</main>;
}
