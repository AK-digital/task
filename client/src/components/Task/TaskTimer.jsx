import { saveTimeTracking } from "@/actions/timeTracking";
import {
  deleteTimeTracking,
  timeTrackingStart,
  timeTrackingStop,
} from "@/api/timeTracking";
import { useUserRole } from "@/app/hooks/useUserRole";
import { AuthContext } from "@/context/auth";
import styles from "@/styles/components/task/task-timer.module.css";
import socket from "@/utils/socket";
import { formatTime, isNotEmpty } from "@/utils/utils";
import { CirclePause, CirclePlay } from "lucide-react";
import { MinusCircle } from "lucide-react";
import moment from "moment";
moment.locale("fr");
import Image from "next/image";
import { useEffect, useState, useActionState, useContext, useRef } from "react";
import { useStopwatch } from "react-timer-hook";

export default function TaskTimer({ task }) {
  const [totalTaskDuration, setTotalTaskDuration] = useState(
    task?.timeTrackings?.reduce((acc, curr) => acc + curr.duration, 0) || 0
  );
  const [stopwatchOffset, setStopwatchOffset] = useState(() => {
    const offset = new Date();
    offset.setTime(offset.getTime() + totalTaskDuration);
    return offset;
  });
  const [sessions, setSessions] = useState(task?.timeTrackings || []);
  const [more, setMore] = useState(false);
  const [addingSession, setAddingSession] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  // Référence pour stocker l'objet stopwatch
  const stopwatchRef = useRef(null);
  const project = task?.projectId;

  const canAdd = useUserRole(project, ["owner", "manager", "team"]);

  // Restaurer l'état du chronomètre lors du chargement du composant
  useEffect(() => {
    const savedState = localStorage.getItem(`taskTimer_${task._id}`);

    if (savedState) {
      const parsedState = JSON.parse(savedState);

      if (parsedState.isRunning) {
        // Calculer le temps écoulé depuis le dernier démarrage
        const elapsedTime =
          Math.floor((new Date().getTime() - parsedState.startTime) / 1000) *
          1000;
        const newOffset = new Date();
        newOffset.setTime(
          newOffset.getTime() + totalTaskDuration + elapsedTime
        );
        setStopwatchOffset(newOffset);

        // Démarrer automatiquement le chronomètre
        setTimeout(() => {
          if (stopwatchRef.current) {
            stopwatchRef.current.reset(newOffset, true); // true pour autostart
            setIsRunning(true);
          }
        }, 100);
      }
    }
  }, [task._id]);

  useEffect(() => {
    const newTotalDuration = sessions.reduce(
      (acc, curr) => acc + curr.duration,
      0
    );
    setTotalTaskDuration(newTotalDuration);

    const newOffset = new Date();
    newOffset.setTime(newOffset.getTime() + newTotalDuration);
    setStopwatchOffset(newOffset);

    // Si on a une référence au stopwatch, on peut le réinitialiser avec le nouvel offset
    if (stopwatchRef.current && !isRunning) {
      stopwatchRef.current.reset(newOffset, false);
    }
  }, [sessions]);

  const {
    hours,
    minutes,
    seconds,
    start,
    pause,
    reset, // On récupère la fonction reset
  } = useStopwatch({
    autoStart: false,
    offsetTimestamp: stopwatchOffset,
    interval: 20,
  });

  // On stocke les fonctions du stopwatch dans la référence
  useEffect(() => {
    stopwatchRef.current = { reset, start, pause };
  }, [reset, start, pause]);

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(seconds).padStart(2, "0");

  const handlePauseTimer = async () => {
    pause();
    setIsRunning(false);

    const res = await timeTrackingStop(task?._id, project?._id);

    if (res?.success && res?.data) {
      const newSession = res.data;
      setSessions((prev) => [...prev, newSession]);
      localStorage.removeItem(`taskTimer_${task._id}`);
    } else {
      setSessions(task?.timeTrackings || []);
    }

    socket.emit("update task", project?._id);
  };

  const handlePlayTimer = async () => {
    // On réinitialise le timer avec l'offset actuel avant de démarrer
    reset(stopwatchOffset);
    start();
    setIsRunning(true);

    await timeTrackingStart(task?._id, project?._id);

    localStorage.setItem(
      `taskTimer_${task._id}`,
      JSON.stringify({ isRunning: true, startTime: new Date().getTime() })
    );
  };

  return (
    <div className={styles.container} data-running={isRunning} id="task-row">
      {/* TIMER */}
      <span className={styles.timer} data-center={!canAdd}>
        {canAdd && (
          <>
            {isRunning ? (
              <CirclePause
                data-running={isRunning}
                onClick={handlePauseTimer}
              />
            ) : (
              <CirclePlay data-running={isRunning} onClick={handlePlayTimer} />
            )}
          </>
        )}
        <span onClick={() => setMore(true)}>
          {formattedHours + ":" + formattedMinutes + ":" + formattedSeconds}
        </span>
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
                {canAdd && (
                  <div className={styles.addTime}>
                    <button onClick={() => setAddingSession(true)}>
                      Ajouter une session
                    </button>
                  </div>
                )}
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
    task?.projectId?._id
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

      socket.emit("update task", task?.projectId?._id);
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

    const res = await deleteTimeTracking(sessionId, task.projectId?._id);

    if (!res.success) {
      setSessions(task?.timeTrackings || []);
    }

    socket.emit("update task", task.projectId?._id);
  }

  return (
    <div className={styles.sessions} data-overflow={sessions?.length > 6}>
      <ul>
        {sessions.map((session, index) => {
          const user = session?.userId;
          const endDate = moment(session?.endTime).format("D MMM");
          const hoursStart = moment(session?.startTime).format("HH:mm");
          const hoursEnd = moment(session?.endTime).format("HH:mm");

          //  Not showing the session if it's running
          if (session?.isRunning === true) return null;

          return (
            <li
              key={`session-${session?._id}-${index}`}
              className={styles.session}
            >
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
