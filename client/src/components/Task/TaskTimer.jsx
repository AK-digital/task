import { saveTimeTracking, updateTimeTracking } from "@/actions/timeTracking";
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
import { CirclePause, CirclePlay, Timer, Trash, Edit } from "lucide-react";
import moment from "moment";
moment.locale("fr");
import Image from "next/image";
import { useEffect, useState, useActionState, useContext, useRef, startTransition } from "react";
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
  const [editingSession, setEditingSession] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // NOUVEAU: Flag pour différencier les mises à jour locales des externes
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);

  const stopwatchRef = useRef(null);
  const project = task?.projectId;

  const canAdd = useUserRole(project, ["owner", "manager", "team", "customer"]);
  const canEditAll = useUserRole(project, ["owner", "manager"]);

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
      className="task-col-timer task-content-col  relative justify-start data-[running=true]:text-inherit"
      data-running={isRunning}
    >
      <span
        className="flex items-center justify-center gap-1 xl:gap-2  xl:text-normal cursor-pointer data-[center=true]:w-full data-[center=true]:justify-center"
        data-center={!canAdd}
      >
        {canAdd && (
          <>
            {isRunning ? (
              <CirclePause
                className="w-4 h-4 xl:w-5 xl:h-5 stroke-[1.5px] cursor-pointer hover:text-accent-color"
                data-running={isRunning}
                onClick={handlePauseTimer}
              />
            ) : (
              <CirclePlay
                className="w-4 h-4 xl:w-5 xl:h-5 stroke-[1.5px] cursor-pointer hover:text-accent-color"
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
          className="w-[360px] p-0"
        >
          <div className="rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-300">
              <h3 className="font-medium text-sm text-black">Gestion du temps</h3>
              {(addingSession || editingSession) && (
                <span
                  className="text-sm px-2 py-1 border border-accent-color text-accent-color hover:bg-accent-color hover:text-white rounded transition-colors cursor-pointer select-none"
                  onClick={() => {
                    setAddingSession(false);
                    setEditingSession(null);
                  }}
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
            ) : editingSession ? (
              <TimeTrackingForm
                task={task}
                formatTime={formatTime}
                setSessions={handleLocalSessionUpdate}
                editingSession={editingSession}
                setEditingSession={setEditingSession}
              />
            ) : (
              <div className="p-3">
                {canAdd && (
                  <div className="mb-4">
                    <span
                      className="w-full text-[15px] px-3 py-2 border border-accent-color text-white bg-accent-color hover:bg-accent-color-hover rounded transition-colors cursor-pointer block text-center"
                      onClick={() => setAddingSession(true)}
                    >
                      Ajouter une session
                    </span>
                  </div>
                )}
                {isNotEmpty(sessions) && (
                  <TimeTrackingSessions
                    task={task}
                    sessions={sessions}
                    setSessions={handleLocalSessionUpdate}
                    formatTime={formatTime}
                    canEditAll={canEditAll}
                    setEditingSession={setEditingSession}
                  />
                )}
              </div>
            )}
          </div>
        </FloatingMenu>
      )}
    </div>
  );
}

export function TimeTrackingForm({ task, formatTime, setSessions, editingSession, setEditingSession }) {
  const [startTime, setStartTime] = useState(
    editingSession ? moment(editingSession.startTime).format("HH:mm") : moment().format("HH:mm")
  );
  const [endTime, setEndTime] = useState(
    editingSession ? moment(editingSession.endTime).format("HH:mm") : ""
  );
  const [timeExpected, setTimeExpected] = useState("00:00:00");

  const initialState = {
    status: "pending",
    message: "",
    data: null,
    errors: null,
  };

  const actionWithIds = editingSession 
    ? updateTimeTracking.bind(null, editingSession._id, task?.projectId?._id)
    : saveTimeTracking.bind(null, task._id, task?.projectId?._id);
    
  const [state, formAction, pending] = useActionState(
    actionWithIds,
    initialState
  );

  useEffect(() => {
    if (editingSession && startTime && endTime) {
      const newTimeExpected = calculateTimeDifference(startTime, endTime);
      setTimeExpected(newTimeExpected);
    }
  }, [editingSession, startTime, endTime]);

  useEffect(() => {
    if (state?.status === "success") {
      if (editingSession) {
        // Mode édition : mettre à jour la session existante
        const updatedSession = state?.data;
        setSessions((prev) => 
          prev.map(session => 
            session._id === editingSession._id ? updatedSession : session
          )
        );
        setEditingSession(null);
      } else {
        // Mode création : ajouter une nouvelle session
        setStartTime(moment().format("HH:mm"));
        setEndTime("");
        setTimeExpected("00:00:00");
        const newSession = state?.data;
        setSessions((prev) => [...prev, newSession]);
      }

      socket.emit("update task", task?.projectId?._id);
    }
  }, [state, editingSession, setEditingSession, setSessions, task?.projectId?._id]);

  const calculateTimeDifference = (startTime, endTime) => {
    if (!startTime || !endTime) return "00:00:00";

    try {
      const [startHours, startMinutes] = startTime.split(":");
      const [endHours, endMinutes] = endTime.split(":");

      // Validation des valeurs
      if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
        return "00:00:00";
      }

      const startDate = new Date();
      startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);

      const endDate = new Date();
      endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);

      if (endDate < startDate) {
        endDate.setDate(endDate.getDate() + 1);
      }

      const diffInSeconds = Math.floor((endDate - startDate) / 1000);
      
      // S'assurer que la différence est positive
      if (diffInSeconds < 0) {
        return "00:00:00";
      }

      return formatTime(diffInSeconds);
    } catch (error) {
      console.error("Error calculating time difference:", error);
      return "00:00:00";
    }
  };

  const handleStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    if (endTime && newStartTime) {
      const newTimeExpected = calculateTimeDifference(newStartTime, endTime);
      setTimeExpected(newTimeExpected);
    } else {
      setTimeExpected("00:00:00");
    }
  };

  const handleEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEndTime(newEndTime);
    if (startTime && newEndTime) {
      const newTimeExpected = calculateTimeDifference(startTime, newEndTime);
      setTimeExpected(newTimeExpected);
    } else {
      setTimeExpected("00:00:00");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation avant envoi
    if (!startTime || !endTime) {
      console.error("Start time and end time are required");
      return;
    }
    
    if (timeExpected === "00:00:00") {
      console.error("Invalid time range");
      return;
    }
    
    const formData = new FormData(e.target);
    formAction(formData);
  };

  return (
    <div className="p-3">
      <form onSubmit={handleSubmit} className="gap-2 pt-2">
        <div className="flex flex-row gap-2 w-full">
            <input
              className="w-full px-2 py-1 text-sm  border border-gray-300 rounded focus:border-accent-color focus:outline-none relative z-10"
              type="date"
              name="date"
              id="date"
              defaultValue={
                editingSession 
                  ? moment(editingSession.startTime).format("YYYY-MM-DD")
                  : moment().format("YYYY-MM-DD")
              }
            />
    
            <input
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-accent-color focus:outline-none relative z-10"
              type="time"
              name="start-time"
              id="start-time"
              onChange={handleStartTimeChange}
              value={startTime}
            />
     
            <input
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:border-accent-color focus:outline-none relative z-10"
              type="time"
              name="end-time"
              id="end-time"
              onChange={handleEndTimeChange}
              value={endTime}
            />
        </div>
      
          <div className="pt-3 flex items-center justify-between w-full">
            <span className="text-sm font-medium text-gray-700">
              Durée: {timeExpected}
            </span>
            <span
              className="text-sm  px-3 py-1 border border-accent-color text-white bg-accent-color hover:bg-accent-color-hover rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              onClick={pending || !startTime || !endTime || timeExpected === "00:00:00" ? undefined : (e) => {
                e.preventDefault();
                const form = e.target.closest('form');
                if (form) {
                  const formData = new FormData(form);
                  startTransition(() => {
                    formAction(formData);
                  });
                }
              }}
              style={{
                opacity: pending || !startTime || !endTime || timeExpected === "00:00:00" ? 0.5 : 1,
                cursor: pending || !startTime || !endTime || timeExpected === "00:00:00" ? 'not-allowed' : 'pointer'
              }}
            >
              {editingSession ? "Modifier la session" : "Ajouter la session"}
            </span>
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
  canEditAll,
  setEditingSession,
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
    <div className="border-t border-gray-300 pt-3">
      <h4 className="text-xs font-medium text-gray-700 mb-2">Sessions enregistrées</h4>
      <div className="max-h-[150px] overflow-y-auto">
        <div className="space-y-2">
          {sessions.map((session, index) => {
            const user = session?.userId;
            const endDate = moment(session?.endTime).format("D MMM");
            const hoursStart = moment(session?.startTime).format("HH:mm");
            const hoursEnd = moment(session?.endTime).format("HH:mm");

            //  Not showing the session if it's running
            if (session?.isRunning === true) return null;

            return (
              <div
                key={`session-${session?._id}-${index}`}
                className="flex items-center justify-between py-1.5 px-2 bg-white rounded border border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-2 select-none">
                  <Image
                    src={user?.picture || "/default/default-pfp.webp"}
                    width={20}
                    height={20}
                    className="w-5 h-5 object-cover rounded-full"
                    alt={`Photo de profil de ${user?.firstName}`}
                  />
                  <span className="text-sm text-gray-600">{endDate}</span>
                </div>
                <span className="text-sm text-gray-600 select-none">
                  {hoursStart} - {hoursEnd}
                </span>
                <span className="text-sm font-medium text-gray-800 select-none">
                  {formatTime(Math.floor(session?.duration / 1000))}
                </span>
                <div className="flex items-center gap-1">
                  {(uid === user?._id || canEditAll) && (
                    <span
                      className="text-gray-400 hover:text-accent-color transition-colors p-1 cursor-pointer"
                      onClick={() => setEditingSession(session)}
                      title="Modifier cette session"
                    >
                      <Edit size={14} />
                    </span>
                  )}
                  {uid === user?._id && (
                    <span
                      className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                      onClick={() => handleDeleteSession(session?._id)}
                      title="Supprimer cette session"
                    >
                      <Trash size={14} />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
