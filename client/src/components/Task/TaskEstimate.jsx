"use client";
import { updateTaskEstimate } from "@/api/task";
import { useUserRole } from "@/app/hooks/useUserRole";
import styles from "@/styles/components/task/task-estimate.module.css";
import { getFloating, usePreventScroll } from "@/utils/floating";
import { bricolageGrostesque } from "@/utils/font";
import socket from "@/utils/socket";
import { XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function TaskEstimate({ task, uid }) {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [number, setNumber] = useState(1);
  const [week, setWeek] = useState("minutes");
  const [estimation, setEstimation] = useState(task?.estimation || "-");
  const [hover, setHover] = useState(false);
  const hasEstimation = estimation !== "-";
  const project = task?.projectId;
  const canEdit = useUserRole(project, ["owner", "manager", "team"]);

  const { refs, floatingStyles } = getFloating(isEditing, setIsEditing);

  usePreventScroll({
    elementRef: refs.floating,
    shouldPrevent: true,
    mode: "element",
  });

  // Update estimation when task is updated (from another user)
  useEffect(() => {
    setEstimation(task?.estimation || "-");
  }, [task?.estimation]);

  const handleUpdateTaskEstimate = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    setHover(false);

    const value = e.target.innerText;

    setEstimation(value);

    const response = await updateTaskEstimate(task?._id, project?._id, value);

    if (!response?.success) {
      setEstimation(task?.estimation || "-");
      return;
    }

    socket.emit("update task", project?._id);
  };

  const handleDeleteEstimation = async (e) => {
    e.preventDefault();
    setEstimation("-");

    const response = await updateTaskEstimate(task?._id, project?._id, "");

    if (!response?.success) {
      setEstimation(task?.estimation || "-");
      return;
    }

    socket.emit("update task", project?._id);

    setIsEditing(false);
  };

  const handleCustomeEstimation = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    setHover(false);

    let value = `${number} ${week}`;

    if (number <= 1) {
      const newWeek = week.slice(0, -1);
      setWeek(newWeek);
      value = `${number} ${newWeek}`;
    }

    setEstimation(value);

    const response = await updateTaskEstimate(task?._id, project?._id, value);

    if (!response?.success) {
      setEstimation(task?.estimation || "-");
      return;
    }

    setNumber(1);
    setWeek("minutes");

    socket.emit("update task", project?._id);
  };

  const handleHover = useCallback(() => {
    if (!canEdit) return;

    setHover(true);
  }, [project, uid]);

  const handleIsEditing = useCallback(() => {
    if (!canEdit) return;

    setIsEditing((prev) => !prev);
  }, [project, uid]);

  return (
    <div
      className={styles.container}
      onMouseEnter={handleHover}
      onMouseLeave={() => setHover(false)}
    >
      <div
        data-estimation={hasEstimation}
        className={styles.wrapper}
        onClick={handleIsEditing}
        ref={refs.setReference}
      >
        <span>{estimation}</span>
      </div>
      {hover && hasEstimation && (
        <div className={styles.delete} onClick={handleDeleteEstimation}>
          <XCircle size={16} />
        </div>
      )}
      {isEditing && (
        <>
          <div
            className={styles.edit}
            id="popover"
            ref={refs.setFloating}
            style={floatingStyles}
          >
            <div className={styles.suggestions}>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                {t("tasks.n_minutes", { n: 15 })}
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                {t("tasks.n_minutes", { n: 30 })}
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                {t("tasks.n_minutes", { n: 45 })}
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                {t("tasks.1_hour")}
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                {t("tasks.2_hours")}
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                {t("tasks.1_day")}
              </span>
            </div>
            <div className={styles.custom}>
              <form className={styles.form} onSubmit={handleCustomeEstimation}>
                <div className={styles.row}>
                  <input
                    type="number"
                    id="number"
                    name="number"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    step={0.1}
                    min={1}
                    max={99}
                    className={bricolageGrostesque.className}
                  />
                  <select
                    name=""
                    id=""
                    className={bricolageGrostesque.className}
                    onChange={(e) => setWeek(e.target.value)}
                  >
                    <option value="minutes">{t("tasks.minutes")}</option>
                    <option value="heures">{t("tasks.hours")}</option>
                    <option value="jours">{t("tasks.days")}</option>
                    <option value="semaines">{t("tasks.weeks")}</option>
                  </select>
                </div>
                {number >= 1 && (
                  <div className={styles.buttons}>
                    <button
                      className={bricolageGrostesque.className}
                      type="submit"
                    >
                      {t("tasks.validate")}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          <div
            id="modal-layout-opacity"
            onClick={() => setIsEditing(false)}
          ></div>
        </>
      )}
    </div>
  );
}
