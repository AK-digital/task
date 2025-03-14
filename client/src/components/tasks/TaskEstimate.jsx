"use client";
import { updateTaskEstimate } from "@/api/task";
import styles from "@/styles/components/tasks/task-estimate.module.css";
import { bricolageGrostesque } from "@/utils/font";
import socket from "@/utils/socket";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { Plus, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function TaskEstimate({ task, project }) {
  const [edit, setEdit] = useState(false);
  const [number, setNumber] = useState(1);
  const [week, setWeek] = useState("minutes");
  const [estimation, setEstimation] = useState(task?.estimation || "-");
  const [hover, setHover] = useState(false);
  const hasEstimation = estimation !== "-";

  // Update estimation when task is updated (from another user)
  useEffect(() => {
    setEstimation(task?.estimation || "-");
  }, [task?.estimation]);

  const handleUpdateTaskEstimate = async (e) => {
    e.preventDefault();
    setEdit(false);
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
    e.preventDefault();
    setEstimation("-");

    const response = await updateTaskEstimate(task?._id, project?._id, "");

    if (!response?.success) {
      setEstimation(task?.estimation || "-");
      return;
    }

    socket.emit("update task", task?.projectId);

    setEdit(false);
  };

  const handleCustomeEstimation = async (e) => {
    e.preventDefault();
    setEdit(false);
    setHover(false);

    const value = `${number} ${week}`;

    setEstimation(value);

    const response = await updateTaskEstimate(task?._id, project?._id, value);

    if (!response?.success) {
      setEstimation(task?.estimation || "-");
      return;
    }

    setNumber(1);
    setWeek("minutes");

    socket.emit("update task", task?.projectId);
  };

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        data-estimation={hasEstimation}
        className={styles.wrapper}
        onClick={() => setEdit(!edit)}
      >
        <span>{estimation}</span>
      </div>
      {hover && hasEstimation && (
        <div className={styles.delete} onClick={handleDeleteEstimation}>
          <XCircle size={16} />
        </div>
      )}
      {edit && (
        <>
          <div className={styles.edit} id="popover">
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
                <input
                  type="number"
                  id="number"
                  name="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
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
                  <option value="minutes">Minutes</option>
                  <option value="heures">Heures</option>
                  <option value="jours">Jours</option>
                  <option value="semaines">Semaines</option>
                </select>
              </form>
              {/* <button>
                <Plus size={16} /> définir
              </button> */}
            </div>
          </div>
          <div id="modal-layout-opacity" onClick={() => setEdit(false)}></div>
        </>
      )}
    </div>
  );
}
