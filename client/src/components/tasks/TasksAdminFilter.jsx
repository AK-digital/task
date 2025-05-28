import { useProjectContext } from "@/context/ProjectContext";
import styles from "@/styles/components/tasks/tasks-admin-filter.module.css";
import { displayPicture, isNotEmpty } from "@/utils/utils";
import { ChevronDown, CircleUserRound, Undo } from "lucide-react";
import { useState } from "react";

export default function TasksAdminFilter({ queries, setQueries }) {
  const [isOpen, setIsOpen] = useState(false);

  const { project } = useProjectContext();
  const members = project?.members || [];
  const selectedMembers = queries?.responsiblesId || [];

  const hasMembers = queries?.responsiblesId?.length > 0;

  function handleReset() {
    setIsOpen(false);
    setQueries((prev) => ({
      ...prev,
      responsiblesId: null,
    }));
  }

  function handleMemberChange(e) {
    const { value, checked } = e.target;

    if (checked) {
      setQueries((prev) => ({
        ...prev,
        responsiblesId: prev?.responsiblesId
          ? [...prev.responsiblesId, value]
          : [value],
      }));
    } else {
      const deletedResponsible = queries?.responsiblesId?.filter(
        (responsible) => responsible !== value
      );

      setQueries((prev) => ({
        ...prev,
        responsiblesId: deletedResponsible,
      }));
    }
  }

  return (
    <div className={styles.container}>
      <div
        className={styles.current}
        data-open={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CircleUserRound size={18} />
        <span>Responsables</span>
        {hasMembers && (
          <span className={styles.length}>{selectedMembers?.length}</span>
        )}
        <ChevronDown size={16} />
      </div>
      {isOpen && (
        <>
          <div className={styles.dropdown}>
            {isNotEmpty(members) ? (
              <ul>
                <li className={styles.item} onClick={() => handleReset()}>
                  <Undo size={16} />
                  Supprimer les filtres
                </li>
                {members.map((member) => (
                  <li key={member?.user?._id} className={styles.item}>
                    <input
                      type="checkbox"
                      id={member?.user?._id}
                      name={member?.user?._id}
                      value={member?.user?._id}
                      onChange={handleMemberChange}
                      checked={
                        hasMembers
                          ? selectedMembers?.includes(member?.user?._id)
                          : false
                      }
                    />

                    <label htmlFor={member?.user?._id}>
                      {displayPicture(member?.user, 22, 22)}
                      <span>
                        {member?.user?.firstName + " " + member?.user?.lastName}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <span>Aucun membre n'a été trouvé</span>
            )}
          </div>
          <div id="modal-layout-opacity" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
}
