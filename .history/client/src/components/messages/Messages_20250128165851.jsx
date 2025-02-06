"use client";
import styles from "@/styles/components/messages/messages.module.css";
import { getMessages } from "@/api/message";
import Image from "next/image";
import useSWR from "swr";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { isNotEmpty } from "@/utils/utils";
import { useState } from "react";

export default function Messages({ task }) {
  const [more, setMore] = useState(false);
  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}&taskId=${task?._id}`,
    () => getMessages(task.projectId, task._id)
  );

  const messages = data?.data;

  async function handleDeleteMessage() {}

  return (
    <div className={styles.container}>
      {isNotEmpty(messages) && messages?.map((message) => {})}
    </div>
  );
}
