import styles from "@/styles/components/task/task-responsibles.module.css";
import { isNotEmpty, sendNotification } from "@/utils/utils";
import { PlusCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserRole } from "@/app/hooks/useUserRole";
import { addResponsible, removeResponsible } from "@/api/task";
import socket from "@/utils/socket";
import DisplayPicture from "../User/DisplayPicture";

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
    <div className={styles.container} id="task-row">
      <div className={styles.wrapper} id="task-row" onClick={handleIsMoreOpen}>
        {isNotEmpty(responsibles) ? (
          responsibles.slice(0, 3).map((responsible) => {
            return (
              <div className={styles.images} key={responsible?._id}>
                <DisplayPicture
                  user={responsible}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                  }}
                />
              </div>
            );
          })
        ) : (
          <PlusCircle size={24} />
        )}
        {responsibles?.length > 3 && (
          <span className={styles.length}>+{responsibles?.length - 3}</span>
        )}
      </div>

      {isMoreOpen && (
        <>
          <div className={styles.modal}>
            {/* Responsibles */}
            {isNotEmpty(responsibles) && (
              <div className={styles.responsibles}>
                {responsibles?.map((responsible) => {
                  return (
                    <div
                      className={styles.responsible}
                      key={responsible?._id}
                      onClick={() => handleRemoveResponsible(responsible)}
                    >
                      <DisplayPicture
                        user={responsible}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                        }}
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
            <span className={styles.subtitle}>Personnes à inviter</span>
            {/* Members */}
            <div>
              {isNotEmpty(members) && (
                <ul>
                  {members?.map((member) => {
                    return (
                      <li
                        key={member?.user?._id}
                        onClick={() => handleAddResponsible(member?.user)}
                      >
                        <DisplayPicture
                          user={member?.user}
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                          }}
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
            id="modal-layout-opacity"
            onClick={(e) => setIsMoreOpen(false)}
          ></div>
        </>
      )}
    </div>
  );
}
