"use client";
import { getMessages } from "@/api/message";
import useSWR from "swr";

export default function Messages({ task }) {
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessages(task?.projectId, task?._id)
  );

  console.log(data);
  return <div></div>;
}
