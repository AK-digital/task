"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Invitation({ params }) {
    const {id} = await params
  const { data, isLoading } = useSWR();

  return <main>hey</main>;
}
