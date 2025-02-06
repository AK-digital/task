import { getMessages } from "@/api/message";
import useSWR from "swr";

export default function Message({ task }) {
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${projectId}`,
    getMessages(projectId)
  );
  return <div></div>;
}
