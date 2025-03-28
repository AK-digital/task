import { saveTimeTracking } from "@/actions/timeTracking";
import { removeTaskSession } from "@/api/task";
import {
  deleteTimeTracking,
  getTimeTrackings,
  timeTrackingStart,
  timeTrackingStop,
} from "@/api/timeTracking";
import { AuthContext } from "@/context/auth";
import styles from "@/styles/components/tasks/task-timer.module.css";
import socket from "@/utils/socket";
import { isNotEmpty } from "@/utils/utils";
import { CirclePause, CirclePlay } from "lucide-react";
import { MinusCircle } from "lucide-react";
import moment from "moment";
moment.locale("fr");
import Image from "next/image";
import {
  useEffect,
  useState,
  useCallback,
  useActionState,
  useContext,
} from "react";

export default function TaskTimer({ task }) {
  const totalTaskDuration =
    task?.timeTrackings?.reduce((acc, curr) => acc + curr.duration, 0) || 0;
  const [timer, setTimer] = useState(Math.floor(totalTaskDuration / 1000) || 0);
  const [sessions, setSessions] = useState(task?.timeTrackings || []);
  const [more, setMore] = useState(false);
  const [addingSession, setAddingSession] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const durations = sessions.map((session) => session?.duration);
    const totalDuration = durations.reduce((acc, curr) => acc + curr, 0);

    setTimer(Math.floor(totalDuration / 1000));
  }, [sessions]);

  useEffect(() => {
    let intervalId;
    if (isRunning) {
      intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  const handlePauseTimer = async () => {
    setIsRunning(false);
    const res = await timeTrackingStop(task?._id, task?.projectId);

    const newSessions = res?.data || [];

    setSessions((prev) => [...prev, newSessions]);

    if (!res.success) {
      setSessions(task?.timeTrackings || []);
    }

    socket.emit("update task", task?.projectId);
  };

  const handlePlayTimer = async () => {
    setIsRunning(true);
    await timeTrackingStart(task?._id, task?.projectId);
  };

  const formatTime = useCallback((totalSeconds) => {
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
      2,
      "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }, []);

  return (
    <div className={styles.container} data-running={isRunning}>
      {/* TIMER */}
      <span className={styles.timer}>
        {isRunning ? (
          <CirclePause data-running={isRunning} onClick={handlePauseTimer} />
        ) : (
          <CirclePlay data-running={isRunning} onClick={handlePlayTimer} />
        )}
        <span onClick={() => setMore(true)}>{formatTime(timer)}</span>
      </span>
      {more && (
        <>
          <div className={styles.more} id="popover">
            <div className={styles.title}>
              <span>Gestion du temps</span>
              {addingSession && (
                <span
                  className={styles.back}
                  onClick={(e) => setAddingSession(false)}
                >
                  Retour
                </span>
              )}
            </div>
            {addingSession ? (
              <TimeTrackingForm
                task={task}
                formatTime={formatTime}
                setSessions={setSessions}
              />
            ) : (
              <div className={styles.content}>
                <div className={styles.addTime}>
                  <button onClick={() => setAddingSession(true)}>
                    Ajouter une session
                  </button>
                </div>
                {isNotEmpty(sessions) && (
                  <TimeTrackingSessions
                    task={task}
                    sessions={sessions}
                    setSessions={setSessions}
                    formatTime={formatTime}
                  />
                )}
              </div>
            )}
          </div>
          <div id="modal-layout-opacity" onClick={(e) => setMore(false)}></div>
        </>
      )}
    </div>
  );
}

export function TimeTrackingForm({ task, formatTime, setSessions }) {
  const [startTime, setStartTime] = useState(moment().format("HH:mm"));
  const [endTime, setEndTime] = useState("");
  const [timeExpected, setTimeExpected] = useState("00:00:00");

  const initialState = {
    status: "pending",
    message: "",
    data: null,
    errors: null,
  };

  const saveTimeTrackingWithIds = saveTimeTracking.bind(
    null,
    task._id,
    task.projectId
  );
  const [state, formAction, pending] = useActionState(
    saveTimeTrackingWithIds,
    initialState
  );

  useEffect(() => {
    if (state?.status === "success") {
      setStartTime(moment().format("HH:mm"));
      setEndTime("");
      setTimeExpected("00:00:00");
      const newSession = state?.data;
      setSessions((prev) => [...prev, newSession]);

      socket.emit("update task", task?.projectId);
    }
  }, [state]);

  const calculateTimeDifference = (startTime, endTime) => {
    if (!startTime || !endTime) return;

    const [startHours, startMinutes] = startTime.split(":");
    const [endHours, endMinutes] = endTime.split(":");

    const startDate = new Date();
    startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0);

    const endDate = new Date();
    endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }

    const diffInSeconds = Math.floor((endDate - startDate) / 1000);
    return formatTime(diffInSeconds);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
    if (endTime) {
      setTimeExpected(calculateTimeDifference(e.target.value, endTime));
    }
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
    if (startTime) {
      setTimeExpected(calculateTimeDifference(startTime, e.target.value));
    }
  };

  return (
    <div className={styles.content}>
      <form action={formAction} className={styles.form}>
        <div className={styles.dateInput}>
          <label>Date de début</label>
          <input
            type="date"
            name="date"
            id="date"
            defaultValue={moment().format("YYYY-MM-DD")}
          />
        </div>
        <div className={styles.timeInputs}>
          <div>
            <label>Heure de début</label>
            <input
              type="time"
              name="start-time"
              id="start-time"
              onChange={handleStartTimeChange}
              defaultValue={moment().format("HH:mm")}
            />
          </div>
          <div>
            <label>Heure de fin</label>
            <input
              type="time"
              name="end-time"
              id="end-time"
              onChange={handleEndTimeChange}
            />
          </div>
        </div>
        <div className={styles.buttons}>
          <span>{timeExpected}</span>
          <button type="submit" disabled={pending} data-disabled={pending}>
            Ajouter la session
          </button>
        </div>
      </form>
    </div>
  );
}

export function TimeTrackingSessions({
  task,
  sessions,
  setSessions,
  formatTime,
}) {
  const { uid } = useContext(AuthContext);
  async function handleDeleteSession(sessionId) {
    setSessions((prev) => prev.filter((session) => session._id !== sessionId));

    const res = await deleteTimeTracking(sessionId, task.projectId);

    if (!res.success) {
      setSessions(task?.timeTrackings || []);
    }

    socket.emit("update task", task.projectId);
  }

  return (
    <div className={styles.sessions} data-overflow={sessions?.length > 6}>
      <ul>
        {sessions.map((session, index) => {
          const user = session?.userId;
          const endDate = moment(session?.endTime).format("D MMM");
          const hoursStart = moment(session?.startTime).format("HH:mm");
          const hoursEnd = moment(session?.endTime).format("HH:mm");

          return (
            <li key={session?._id}>
              <div className={styles.monthDay}>
                <Image
                  src={user?.picture || "/default-pfp.webp"}
                  width={25}
                  height={25}
                  style={{ borderRadius: "50%" }}
                  alt={`Photo de profil de ${user?.firstName}`}
                />
                <span>{endDate}</span>
              </div>
              <span className={styles.hours}>
                {hoursStart} à {hoursEnd}
              </span>
              <span className={styles.time}>
                {formatTime(Math.floor(session?.duration / 1000))}
              </span>
              {uid === user?._id && (
                <span
                  className={styles.delete}
                  onClick={() => handleDeleteSession(session?._id)}
                >
                  <MinusCircle />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
