"use client";
import { getMessages } from "@/api/message";
import Image from "next/image";
import useSWR from "swr";

export default function Messages({ task }) {
  const getMessagesWithIds = getMessages.bind(null, task?.projectId, task?._id);

  const { data, isLoading, mutate } = useSWR(
    `/message?projectId=${task?.projectId}`,
    getMessagesWithIds
  );

  const messages = data?.data;
  return (
    <div>
      {messages?.map((message) => {
        const author = message?.author;

        return (
          <div>
            {/* Author informations */}
            <div>
              <Image
                src={author?.picture || "/default-pfp.webp"}
                width={30}
                height={30}
                alt={`Photo de profil de ${author?.picture}`}
              />
            </div>
            {/* text */}
            <div dangerouslySetInnerHTML={{ __html: message?.message }}></div>
          </div>
        );
      })}
    </div>
  );
}
