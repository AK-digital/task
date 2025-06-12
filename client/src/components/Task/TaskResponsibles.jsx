import { isNotEmpty, sendNotification } from "@/utils/utils";
import { PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserRole } from "../../../hooks/useUserRole";
import { addResponsible, removeResponsible } from "@/api/task";
import socket from "@/utils/socket";
import { getFloating, usePreventScroll } from "@/utils/floating";
import DisplayPicture from "@/components/User/DisplayPicture.jsx";
import { useTranslation } from "react-i18next";

export default function TaskResponsibles({ task, uid, user }) {
  const { t } = useTranslation();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [responsibles, setResponsibles] = useState(task?.responsibles || []);
  const filteredMembers = task?.projectId?.members?.filter((member) =>
    responsibles?.every((responsible) => responsible?._id !== member?.user?._id)
  );
  const [members, setMembers] = useState(filteredMembers || []);
  const project = task?.projectId;

  const canAdd = useUserRole(project, ["owner", "manager", "team", "customer"]);

  const { refs, floatingStyles } = getFloating(isMoreOpen, setIsMoreOpen);

  usePreventScroll({ shouldPrevent: isMoreOpen, mode: "body" });

  async function handleAddResponsible(member) {
    if (!canAdd) return;

    setResponsibles((prev) => [...prev, member]);

    const newMembers = members?.filter((m) => m?.user?._id !== member?._id);
    setMembers(newMembers);

    const res = await addResponsible(task?._id, member?._id, project?._id);

    if (!res.success) {
      setResponsibles(task?.responsibles);
      setMembers(filteredMembers);
      return;
    }

    socket.emit("update task", project?._id);

    generateNotification(member);
  }

  function generateNotification(member) {
    const message = {
      title: t("tasks.task_assigned_title", { projectName: project?.name }),
      content: t("tasks.task_assigned_content", { taskText: task?.text }),
    };

    const link = `/projects/${project?._id}/task/${task?._id}`;

    sendNotification(member, user, uid, message, link);
  }

  async function handleRemoveResponsible(responsible) {
    if (!canAdd) return;

    const newResponsibles = responsibles?.filter(
      (r) => r?._id !== responsible?._id
    );
    setResponsibles(newResponsibles);

    const newMembers = [...members, { user: responsible }];
    setMembers(newMembers);

    const res = await removeResponsible(
      task?._id,
      responsible?._id,
      project?._id
    );

    if (!res.success) {
      setResponsibles(task?.responsibles);
      setMembers(filteredMembers);
      return;
    }

    socket.emit("update task", project?._id);
  }

  function handleIsMoreOpen() {
    if (!canAdd) return;

    setIsMoreOpen((prev) => !prev);
  }

  useEffect(() => {
    setResponsibles(task?.responsibles);
  }, [task?.responsibles]);

  return (
    <div className="relative flex items-center justify-center px-3 min-w-[100px] max-w-[100px] w-full h-full border-r border-l border-text-color">
      <div
        className="flex items-center h-full"
        onClick={handleIsMoreOpen}
        ref={refs.setReference}
      >
        {isNotEmpty(responsibles) ? (
          responsibles.slice(0, 3).map((responsible) => {
            return (
              <div
                className="images_TaskResponsibles flex justify-center items-center"
                key={responsible?._id}
              >
                <DisplayPicture
                  user={responsible}
                  style={{ width: "32px", height: "32px" }}
                  className="rounded-full"
                />
              </div>
            );
          })
        ) : (
          <PlusCircle size={24} />
        )}
        {responsibles?.length > 3 && (
          <span className="absolute flex justify-center items-center bg-primary rounded-full min-w-[26px] w-[26px] min-h-[26px] h-[26px] p-1 right-[3px] bottom-2 border-[3px] border-secondary">
            +{responsibles?.length - 3}
          </span>
        )}
      </div>

      {isMoreOpen && (
        <>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            className="absolute w-[300px] bg-secondary shadow-medium rounded-lg top-[50px] z-[2001] p-2"
          >
            {/* Responsibles */}
            {isNotEmpty(responsibles) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {responsibles?.map((responsible) => {
                  return (
                    <div
                      className="flex items-center gap-1 bg-third p-1 rounded-lg text-small font-medium max-w-fit w-full transition-all duration-150 ease-in-out hover:bg-primary"
                      key={responsible?._id}
                      onClick={() => handleRemoveResponsible(responsible)}
                    >
                      <DisplayPicture
                        user={responsible}
                        style={{
                          width: "24px",
                          height: "24px",
                        }}
                        className="rounded-full"
                        isPopup={false}
                      />
                      <span>
                        {responsible.firstName + " " + responsible?.lastName}
                      </span>
                      <X size={16} />
                    </div>
                  );
                })}
              </div>
            )}
            <span className="text-[14px] font-medium text-text-color-muted select-none">
              {t("tasks.people_to_invite")}
            </span>
            {/* Members */}
            <div className="scrollable_TaskResponsibles max-h-[200px] overflow-y-auto">
              {isNotEmpty(members) && (
                <ul className="mt-1.5">
                  {members?.map((member) => {
                    return (
                      <li
                        className="flex items-center gap-1 p-2 rounded-lg hover:bg-third"
                        key={member?.user?._id}
                        onClick={() => handleAddResponsible(member?.user)}
                      >
                        <DisplayPicture
                          user={member?.user}
                          style={{
                            width: "24px",
                            height: "24px",
                          }}
                          className="rounded-full"
                        />
                        <span>{member?.user?.email}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <div
            className="modal-layout-opacity"
            onClick={(e) => setIsMoreOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
