import { displayPicture, isNotEmpty, sendNotification } from "@/utils/utils";
import { PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserRole } from "@/app/hooks/useUserRole";
import { addResponsible, removeResponsible } from "@/api/task";
import socket from "@/utils/socket";

export default function TaskResponsibles({ task, uid, user }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [responsibles, setResponsibles] = useState(task?.responsibles || []);
  const filteredMembers = task?.projectId?.members?.filter((member) =>
    responsibles?.every((responsible) => responsible?._id !== member?.user?._id)
  );
  const [members, setMembers] = useState(filteredMembers || []);
  const project = task?.projectId;

  const canAdd = useUserRole(project, ["owner", "manager", "team", "customer"]);

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
    <div className="relative justify-center px-3 min-w-[100px] max-w-[100px] w-full border-r border-l border-text-color" id="task-row">
      <div className="wrapper_TaskResponsibles" id="task-row" onClick={handleIsMoreOpen}>
        {isNotEmpty(responsibles) ? (
          responsibles.slice(0, 3).map((responsible) => {
            return (
              <div className="images_TaskResponsibles flex justify-center items-center" key={responsible?._id}>
                {displayPicture(responsible, 30, 30)}
              </div>
            );
          })
        ) : (
          <PlusCircle size={24} />
        )}
        {responsibles?.length > 3 && (
          <span className="absolute flex justify-center items-center bg-background-primary-color rounded-full min-w-[26px] w-[26px] min-h-[26px] h-[26px] p-1 right-[3px] bottom-2 border-[3px] border-background-secondary-color">+{responsibles?.length - 3}</span>
        )}
      </div>

      {isMoreOpen && (
        <>
          <div className="absolute w-[300px] bg-background-secondary-color shadow-shadow-box-medium rounded-border-radius-small top-[50px] z-[2001] p-2">
            {/* Responsibles */}
            {isNotEmpty(responsibles) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {responsibles?.map((responsible) => {
                  return (
                    <div
                      className="flex items-center gap-1 bg-background-third-color p-1 rounded-border-radius-small text-text-size-small font-medium max-w-fit w-full transition-all duration-150 ease-in-out hover:bg-background-primary-color"
                      key={responsible?._id}
                      onClick={() => handleRemoveResponsible(responsible)}
                    >
                      {displayPicture(responsible, 24, 24)}
                      <span>
                        {responsible.firstName + " " + responsible?.lastName}
                      </span>
                      <X size={16} />
                    </div>
                  );
                })}
              </div>
            )}
            <span className="text-[14px] font-medium text-text-color-muted">Personnes à inviter</span>
            {/* Members */}
            <div>
              {isNotEmpty(members) && (
                <ul className="mt-1.5">
                  {members?.map((member) => {
                    return (
                      <li
                        className="flex items-center gap-1 p-2 rounded-border-radius-small hover:bg-background-third-color"
                        key={member?.user?._id}
                        onClick={() => handleAddResponsible(member?.user)}
                      >
                        {displayPicture(member?.user, 24, 24)}
                        <span>{member?.user?.email}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
          <div
            id="modal-layout-opacity"
            onClick={(e) => setIsMoreOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
