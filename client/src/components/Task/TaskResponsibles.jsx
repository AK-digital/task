import { isNotEmpty, sendNotification } from "@/utils/utils";
import { PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserRole } from "@/hooks/api/useUserRole";
import { addResponsible, removeResponsible } from "@/api/task";
import { addResponsible as addResponsibleUnified, removeResponsible as removeResponsibleUnified } from "@/actions/unified";
import socket from "@/utils/socket";
import { getFloating, usePreventScroll } from "@/utils/floating";
import DisplayPicture from "@/components/User/DisplayPicture.jsx";
import FloatingMenu from "@/shared/components/FloatingMenu";

export default function TaskResponsibles({ task, uid, user }) {
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

    const res = await addResponsibleUnified(
      task?._id, 
      project?._id, 
      member?._id, 
      task?.isSubtask ? 'subtask' : 'task'
    );

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
      title: `🎉 Une tâche vous a été assignée dans ${project?.name}`,
      content: `Vous venez d'être nommé responsable de la tâche "${task?.text}".`,
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

    const res = await removeResponsibleUnified(
      task?._id,
      project?._id,
      responsible?._id,
      task?.isSubtask ? 'subtask' : 'task'
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
    <div className="task-col-admin task-content-col relative">
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
          <PlusCircle size={20} />
        )}
        {responsibles?.length > 3 && (
          <span className="absolute flex justify-center items-center bg-primary rounded-full min-w-[20px] w-[20px] min-h-[20px] h-[20px] p-1 right-[3px] bottom-2 border-[2px] border-secondary text-xs">
            +{responsibles?.length - 3}
          </span>
        )}
      </div>

      {isMoreOpen && (
        <FloatingMenu
          refs={refs}
          floatingStyles={floatingStyles}
          setIsOpen={setIsMoreOpen}
          className="w-[230px] p-2"
        >
          {/* Responsibles */}
          {isNotEmpty(responsibles) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {responsibles?.map((responsible) => {
                return (
                  <div
                    className="flex items-center gap-1 bg-third p-1 rounded-lg text-small font-medium max-w-fit w-full transition-all duration-150 ease-in-out hover:bg-primary cursor-pointer"
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
            Personnes à inviter
          </span>
          {/* Members */}
          <div className="scrollable_TaskResponsibles max-h-[200px] overflow-y-auto">
            {isNotEmpty(members) && (
              <ul className="mt-1.5">
                {members?.map((member) => {
                  return (
                    <li
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-third cursor-pointer"
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
                      <span className="text-[14px]">
                        {(member?.user?.firstName || member?.user?.lastName)
                          ? `${member?.user?.firstName || ""} ${member?.user?.lastName || ""}`.trim()
                          : member?.user?.email}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </FloatingMenu>
      )}
    </div>
  );
}
