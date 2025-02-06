import { getMessages } from "@/api/message";
import useSWR from "swr";

export default function Message({ task }) {
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessages(task?.projectId, task?._id)
  );
  return <div>hey</div>;
}
