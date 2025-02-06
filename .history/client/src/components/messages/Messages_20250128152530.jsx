import { getMessages } from "@/api/message";
import useSWR from "swr";

export default function Message({ projectId }) {
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${projectId}`,
    getMessages()
  );
  return <div></div>;
}
