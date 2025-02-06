"use client";

import useSWR from "swr";

export default function Invitation({ params }) {
  console.log(params);
  const { data, isLoading } = useSWR();

  return <main>hey</main>;
}
