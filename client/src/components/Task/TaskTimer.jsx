import { saveTimeTracking } from "@/actions/timeTracking";
import {
  deleteTimeTracking,
  timeTrackingStart,
  timeTrackingStop,
} from "@/api/timeTracking";
import { useUserRole } from "../../../hooks/useUserRole";
import { AuthContext } from "@/context/auth";
import { getFloating, usePreventScroll } from "@/utils/floating";
import socket from "@/utils/socket";
import { formatTime, isNotEmpty } from "@/utils/utils";
import { CirclePause, CirclePlay } from "lucide-react";
import { MinusCircle } from "lucide-react";
import moment from "moment";
moment.locale("fr");
import Image from "next/image";
import { useEffect, useState, useActionState, useContext, useRef } from "react";
import { useStopwatch } from "react-timer-hook";
import FloatingMenu from "@/shared/components/FloatingMenu";

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

  // NOUVEAU: Flag pour différencier les mises à jour locales des externes
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);

  const stopwatchRef = useRef(null);
  const project = task?.projectId;

  const canAdd = useUserRole(project, ["owner", "manager", "team"]);

  const { refs, floatingStyles } = getFloating(more, setMore);

  usePreventScroll({
    elementRef: refs.floating,
    shouldPrevent: true,
    mode: "element",
  });

  // Restaurer l'état du chronomètre lors du chargement du composant
  useEffect(() => {
    const savedState = localStorage.getItem(`taskTimer_${task._id}`);

    if (savedState) {
      const parsedState = JSON.parse(savedState);

      if (parsedState.isRunning) {
        const elapsedTime =
          Math.floor((new Date().getTime() - parsedState.startTime) / 1000) *
          1000;
        const newOffset = new Date();
        newOffset.setTime(
          newOffset.getTime() + totalTaskDuration + elapsedTime
        );
        setStopwatchOffset(newOffset);

        setTimeout(() => {
          if (stopwatchRef.current) {
            stopwatchRef.current.reset(newOffset, true);
            setIsRunning(true);
          }
        }, 100);
      }
    }
  }, [task._id]);

  // MODIFIÉ: Seulement émettre si c'est une mise à jour locale
  useEffect(() => {
    const newTotalDuration = sessions.reduce(
      (acc, curr) => acc + curr.duration,
      0
    );
    setTotalTaskDuration(newTotalDuration);

    const newOffset = new Date();
    newOffset.setTime(newOffset.getTime() + newTotalDuration);
    setStopwatchOffset(newOffset);

    if (stopwatchRef.current && !isRunning) {
      stopwatchRef.current.reset(newOffset, false);
    }
    // SEULEMENT émettre si c'est une mise à jour locale
    if (isLocalUpdate) {
      socket.emit("update task", project?._id);
      setIsLocalUpdate(false); // Reset le flag
    }
  }, [sessions, isRunning, project?._id, isLocalUpdate]);

  // MODIFIÉ: Ne pas émettre de socket ici, juste mettre à jour l'état
  useEffect(() => {
    // Éviter les boucles en comparant les données
    const currentSessions = JSON.stringify(sessions);
    const newSessions = JSON.stringify(task?.timeTrackings || []);

    if (currentSessions !== newSessions) {
      setSessions(task?.timeTrackings || []);
    }
  }, [task?.timeTrackings]);

  const { hours, minutes, seconds, start, pause, reset } = useStopwatch({
    autoStart: false,
    offsetTimestamp: stopwatchOffset,
    interval: 20,
  });

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
      setIsLocalUpdate(true); // Marquer comme mise à jour locale
      setSessions((prev) => [...prev, newSession]);
      localStorage.removeItem(`taskTimer_${task._id}`);
    } else {
      setSessions(task?.timeTrackings || []);
    }
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

  const handleLocalSessionUpdate = (newSessions) => {
    setIsLocalUpdate(true);
    setSessions(newSessions);
  };

  return (
    <div
      className="hidden lg:flex relative items-center justify-start max-w-[100px] xl:max-w-[120px] h-full w-full px-1 xl:px-1.5 border-r border-text-light-color data-[running=true]:text-inherit flex-shrink-0"
      data-running={isRunning}
    >
      <span
        className="flex items-center justify-center gap-1 xl:gap-2 text-xs xl:text-normal cursor-pointer data-[center=true]:w-full data-[center=true]:justify-center"
        data-center={!canAdd}
      >
        {canAdd && (
          <>
            {isRunning ? (
              <CirclePause
                className="w-4 h-4 xl:w-5 xl:h-5 cursor-pointer transition-colors duration-150 ease-in-out hover:text-accent-color"
                data-running={isRunning}
                onClick={handlePauseTimer}
              />
            ) : (
              <CirclePlay
                className="w-4 h-4 xl:w-5 xl:h-5 cursor-pointer transition-colors duration-150 ease-in-out hover:text-accent-color"
                data-running={isRunning}
                onClick={handlePlayTimer}
              />
            )}
          </>
        )}
        <span
          className="select-none text-xs xl:text-sm"
          onClick={() => setMore(true)}
          ref={refs.setReference}
        >
          {formattedHours + ":" + formattedMinutes + ":" + formattedSeconds}
        </span>
      </span>
      {more && (
        <FloatingMenu
          setIsOpen={setMore}
          refs={refs}
          floatingStyles={floatingStyles}
          className={`w-[400px] ${
            addingSession ? "max-h-[300px]" : "max-h-[200px]"
          }`}
        >
          <div className="flex justify-between items-center text-[1.1rem] font-medium bg-third p-2 rounded-t">
            <span className="text-text-dark-color select-none">
              Gestion du temps
            </span>
            {addingSession && (
              <span
                className="text-accent-color text-normal cursor-pointer select-none"
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
              setSessions={handleLocalSessionUpdate}
            />
          ) : (
            <div className="flex flex-col gap-4 pt-1.5 pr-4 pb-3 pl-4">
              {canAdd && (
                <div className="flex items-center gap-2">
                  <button
                    className="w-full p-2 rounded"
                    onClick={() => setAddingSession(true)}
                  >
                    Ajouter une session
                  </button>
                </div>
              )}
              {isNotEmpty(sessions) && (
                <TimeTrackingSessions
                  task={task}
                  sessions={sessions}
                  setSessions={handleLocalSessionUpdate}
                  formatTime={formatTime}
                />
              )}
            </div>
          )}
        </FloatingMenu>
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
    <div
      className="flex flex-col gap-4 pt-1.5 pr-4 pb-3 pl-4
"
    >
      <form action={formAction} className="flex flex-col gap-3">
        <div className="mx-auto">
          <label className="relative text-text-color-muted text-normal text-left block select-none">
            Date de début
          </label>
          <input
            className="border-none input_TimeTrackingForm_TaskTimer"
            type="date"
            name="date"
            id="date"
            defaultValue={moment().format("YYYY-MM-DD")}
          />
        </div>
        <div className="flex justify-evenly w-full gap-2">
          <div className="flex flex-col gap-1 items-center">
            <label className="relative text-color-text-color-muted text-normal text-left block select-none">
              Heure de début
            </label>
            <input
              className="w-[65px] !important border-none p-0 !important input_TimeTrackingForm_TaskTimer"
              type="time"
              name="start-time"
              id="start-time"
              onChange={handleStartTimeChange}
              defaultValue={moment().format("HH:mm")}
            />
          </div>
          <div className="flex flex-col gap-1 items-center">
            <label className="relative text-color-text-color-muted text-normal text-left block select-none">
              Heure de fin
            </label>
            <input
              className="w-[65px] border-none p-0 input_TimeTrackingForm_TaskTimer"
              type="time"
              name="end-time"
              id="end-time"
              onChange={handleEndTimeChange}
            />
          </div>
        </div>
        <div className="flex justify-evenly items-center mb-1 mt-3 w-full">
          <span className="select-none">{timeExpected}</span>
          <button
            className="p-2 rounded"
            type="submit"
            disabled={pending}
            data-disabled={pending}
          >
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
    <div
      className="overflow-x-auto max-h-[200px] text-[0.85em] text-text-dark-color data-[overflow=true]:pr-5"
      data-overflow={sessions?.length > 6}
    >
      <ul className="flex flex-col gap-3">
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
              className="flex justify-between items-center gap-2"
            >
              <div className="flex items-center gap-2 select-none">
                <Image
                  src={user?.picture || "/default/default-pfp.webp"}
                  width={25}
                  height={25}
                  className="w-6 h-6 object-cover rounded-full"
                  alt={`Photo de profil de ${user?.firstName}`}
                />
                <span>{endDate}</span>
              </div>
              <span className="flex-1 text-center select-none">
                {hoursStart} à {hoursEnd}
              </span>
              <span className="flex justify-end min-w-[70px] select-none">
                {formatTime(Math.floor(session?.duration / 1000))}
              </span>
              {uid === user?._id && (
                <span
                  className="ml-2.5 flex cursor-pointer"
                  onClick={() => handleDeleteSession(session?._id)}
                >
                  <MinusCircle className="text-color-text-color-red hover:text-color-blocked-color" />
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
