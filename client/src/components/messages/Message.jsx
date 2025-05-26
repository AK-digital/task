"use client";

import styles from "@/styles/components/messages/message.module.css";
import { useCallback, useContext, useEffect, useState } from "react";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisH,
  faPen,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { deleteMessage, updateReadBy } from "@/api/message";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import Tiptap from "../RichTextEditor/Tiptap";
import { Eye } from "lucide-react";
import { isNotEmpty } from "@/utils/utils";
import UsersInfo from "../Popups/UsersInfo";
import Reactions from "../Reactions/Reactions";

export default function Message({ task, message, project, mutateMessage }) {
  const { uid } = useContext(AuthContext);
  const [edit, setEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [more, setMore] = useState(false);
  const [showPeopleRead, setShowPeopleRead] = useState(false);

  moment.locale("fr");
  const author = message?.author;
  const date = moment(message?.createdAt);
  const formattedDate = date.format("DD/MM/YYYY [à] HH:mm");

  const handleReadBy = useCallback(async () => {
    if (uid === author?._id) return;
    if (!message?.readBy?.includes(uid)) {
      const response = await updateReadBy(project?._id, message?._id);

      if (!response?.success) return;

      socket.emit("update task", project?._id);
    }
  }, [uid, author?._id, message?.readBy, project?._id, message?._id]);

  useEffect(() => {
    handleReadBy();
  }, [handleReadBy]);

  async function handleDeleteMessage() {
    setMore(false);
    setIsLoading(true);
    const response = await deleteMessage(message?.projectId, message?._id);

    if (!response?.success) return;

    await mutateMessage();
    socket.emit("update message", message?.projectId);
    socket.emit("update task", project?._id);

    setIsLoading(false);
  }

  return (
    <>
      {edit ? (
        <Tiptap
          project={project}
          task={task}
          type="message"
          mutateMessage={mutateMessage}
          setConvOpen={setEdit}
          editMessage={true}
          message={message}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2 transition-opacity duration-[50ms] ease-linear data-[loading=true]:opacity-[0.4] " data-loading={isLoading}>
            <div className="relative flex justify-between flex-col gap-3.5 py-4 px-6 bg-background-secondary-color rounded-lg transition-all duration-[50ms] ease-linear">
              {/* Header auteur */}
              <div className="flex items-center justify-between [&_svg]:cursor-pointer ">
                <div className="flex items-center gap-2">
                  <Image
                    src={author?.picture || "/default-pfp.webp"}
                    width={35}
                    height={35}
                    alt={`Photo de profil de ${author?.firstName}`}
                    style={{ borderRadius: "50%" }}
                  />
                  <span className="text-text-size-normal font-medium">
                    {author?.firstName + " " + author?.lastName}
                  </span>
                  <span className="text-xs text-text-color-muted">{formattedDate}</span>
                </div>
                <div>
                  {uid === author?._id && (
                    <FontAwesomeIcon
                      icon={faEllipsisH}
                      onClick={() => setMore(true)}
                    />
                  )}
                  {more && (
                    <div className="absolute z-2001 right-6 w-fit p-2 bg-background-secondary-color rounded-sm shadow-shadow-box-medium">
                      <ul className="m-0 p-0 list-none [&_svg]:max-w-[14px] [&_svg]:max-h-[14px] [&_li:hover]:bg-background-third-color [&_li:hover]:rounded-sm">
                        <li
                          onClick={() => {
                            setEdit(true);
                            setMore(false);
                          }}
                          className="flex items-center gap-2 p-2 text-text-size-small cursor-pointer transition-[background-color] duration-[120ms] ease-linear"
                        >
                          <FontAwesomeIcon icon={faPen} /> Modifier
                        </li>
                        <li onClick={handleDeleteMessage} className="flex items-center gap-2 p-2 text-text-size-small text-text-color-red  cursor-pointer transition-[background-color] duration-[120ms] ease-linear">
                          <FontAwesomeIcon icon={faTrashAlt} /> Supprimer
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="text_Message">
                <div dangerouslySetInnerHTML={{ __html: message?.message }} />
              </div>
            </div>

            <div className="flex items-center ml-3 gap-2">
              {/* Lecteurs */}
              <div
                className="relative flex items-center gap-1"
                onMouseEnter={() => setShowPeopleRead(true)}
                onMouseLeave={() => setShowPeopleRead(false)}
              >
                <Eye size={16} />
                <span>{message?.readBy?.length}</span>

                {showPeopleRead && isNotEmpty(message?.readBy) && (
                  <UsersInfo users={message?.readBy} />
                )}
              </div>

              {/* Reactions */}
              <Reactions
                element={message}
                project={project}
                task={task}
                mutateMessage={mutateMessage}
                type={"message"}
              />
            </div>
          </div>

          {more && (
            <div className="modal-layout-opacity" onClick={() => setMore(false)} />
          )}
        </>
      )}
    </>
  );
}
