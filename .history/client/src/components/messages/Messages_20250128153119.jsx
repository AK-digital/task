"use client";
import { getMessages } from "@/api/message";
import useSWR from "swr";

export default function Messages({ task }) {
  const getMessagesWithIds = getMessages.bind(null, task?.projectId, task?._id);
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessagesWithIds
  );

  console.log(data);
  return <div></div>;
}
