"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

export default function Invitation() {
  const { data, isLoading } = useSWR();

  return <main>hey</main>;
}
