"use client";
import { updateTaskEstimate } from "@/api/task";
import styles from "@/styles/components/tasks/task-estimate.module.css";
import { bricolageGrostesque } from "@/utils/font";
import socket from "@/utils/socket";
import { checkRole } from "@/utils/utils";
import { XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function TaskEstimate({ task, project, uid, handleStopPropa }) {
  const [isEditing, setIsEditing] = useState(false);
  const [estimation, setEstimation] = useState(task?.estimation || "-");
  const [hover, setHover] = useState(false);
  const hasEstimation = estimation !== "-";

  const [number, setNumber] = useState(1);
  const isSingular = number <= 1;

  const [week, setWeek] = useState("minutes");

  const minutes = isSingular ? "minute" : "minutes";
  const heures = isSingular ? "heure" : "heures";
  const jours = isSingular ? "jour" : "jours";
  const semaines = isSingular ? "semaine" : "semaines";

  useEffect(() => {
    const estimation = task?.estimation ?? "-";

    const match = estimation.match(
      /^(\d{1,2})\s*(jour|jours|minute|minutes|seconde|secondes|semaine|semaines|heure|heures)$/i
    );

    if (match) {
      setNumber(parseInt(match[1], 10));
      if (match[2].toLowerCase().endsWith("s")) {
        setWeek(match[2].toLowerCase());
      } else {
        setWeek(match[2].toLowerCase() + "s");
      }
    } else {
      setWeek("minutes");
      setNumber(1);
    }
  }, [task?.estimation]);

  // Update estimation when task is updated (from another user)
  useEffect(() => {
    setEstimation(task?.estimation || "-");
  }, [task?.estimation]);

  const handleUpdateTaskEstimate = async (e) => {
    e.stopPropagation();
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

    socket.emit("update task", task?.projectId);
  };

  const handleDeleteEstimation = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    setEstimation("-");

    const response = await updateTaskEstimate(task?._id, project?._id, "");

    if (!response?.success) {
      setEstimation(task?.estimation || "-");
      return;
    }

    socket.emit("update task", task?.projectId);

    setIsEditing(false);
  };

  const handleCustomeEstimation = async (e) => {
    e.preventDefault();
    setIsEditing(false);
    setHover(false);

    let value = `${number} ${week}`;
    if (isSingular) {
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
    const isAuthorized = checkRole(project, ["owner", "manager", "team"], uid);

    if (!isAuthorized) return;

    setHover(true);
  }, [project, uid]);

  const handleIsEditing = useCallback(
    (e) => {
      e.stopPropagation();
      const isAuthorized = checkRole(
        project,
        ["owner", "manager", "team"],
        uid
      );

      if (!isAuthorized) return;

      setIsEditing((prev) => !prev);
    },
    [project, uid]
  );

  return (
    <div
      className={styles.container}
      data-is-open={isEditing ? "true" : "false"}
      onMouseEnter={handleHover}
      onMouseLeave={() => setHover(false)}
    >
      <div
        data-estimation={hasEstimation}
        className={styles.wrapper}
        onClick={handleIsEditing}
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
          <div className={styles.edit} id="popover" onClick={handleStopPropa}>
            <div className={styles.suggestions}>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                15 minutes
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                30 minutes
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                45 minutes
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                1 heure
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                2 heures
              </span>
              <span
                className={styles.suggestion}
                onClick={handleUpdateTaskEstimate}
              >
                1 jour
              </span>
            </div>
            <div className={styles.custom}>
              <form className={styles.form} onSubmit={handleCustomeEstimation}>
                <div className={styles.row} onClick={handleStopPropa}>
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
                    value={week}
                    onChange={(e) => setWeek(e.target.value)}
                  >
                    <option value="minutes">{minutes}</option>
                    <option value="heures">{heures}</option>
                    <option value="jours">{jours}</option>
                    <option value="semaines">{semaines}</option>
                  </select>
                </div>
                {number >= 1 && (
                  <div className={styles.buttons} onClick={handleStopPropa}>
                    <button
                      className={bricolageGrostesque.className}
                      type="submit"
                    >
                      Valider
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
          <div
            id="modal-layout-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(false);
            }}
          ></div>
        </>
      )}
    </div>
  );
}
