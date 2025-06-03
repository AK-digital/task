import { useProjectContext } from "@/context/ProjectContext";
import styles from "@/styles/components/tasks/tasks-admin-filter.module.css";
import { ChevronDown, CircleUserRound, Undo } from "lucide-react";
import { useState } from "react";
import DisplayPicture from "@/components/User/DisplayPicture";
import { isNotEmpty } from "@/utils/utils";
import { useTranslation } from "react-i18next";

export default function TasksAdminFilter({ queries, setQueries }) {
  const { t } = useTranslation();
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
        <span>{t("tasks.responsibles")}</span>
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
                  {t("tasks.remove_filters")}
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
                      <DisplayPicture
                        user={member?.user}
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                        }}
                        isPopup={false}
                      />
                      <span>
                        {member?.user?.firstName + " " + member?.user?.lastName}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            ) : (
              <span>{t("tasks.no_member_found")}</span>
            )}
          </div>
          <div id="modal-layout-opacity" onClick={() => setIsOpen(false)}></div>
        </>
      )}
    </div>
  );
}
