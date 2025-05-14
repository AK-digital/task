"use client";
import TaskMore from "@/components/Task/TaskMore";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Panel() {
  const pathname = usePathname();

  useEffect(() => {}, []);

  return <TaskMore />;
}
