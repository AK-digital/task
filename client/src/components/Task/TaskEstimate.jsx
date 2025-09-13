"use client";
import { updateTaskEstimate } from "@/api/task";
import { useUserRole } from "../../../hooks/useUserRole";
import { getFloating, usePreventScroll } from "@/utils/floating";
import socket from "@/utils/socket";
import { CircleX, Clock } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import FloatingMenu from "@/shared/components/FloatingMenu";

export default function TaskEstimate({ task, uid }) {
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
      className="hidden lg:flex justify-center items-center py-1 px-1 xl:px-2 border-r border-text-light-color min-w-[90px] xl:min-w-[110px] max-w-[130px] w-full h-full gap-0.5 flex-shrink-0 relative"
      onMouseEnter={handleHover}
      onMouseLeave={() => setHover(false)}
    >
      <div
        data-estimation={hasEstimation}
        onClick={handleIsEditing}
        ref={refs.setReference}
        className="relative w-full bg-primary rounded-3xl py-1 px-1 text-center cursor-pointer text-xs xl:text-small overflow-visible flex items-center justify-center gap-1"
      >
        {hasEstimation ? (
          <span className="relative z-10 select-none font-medium whitespace-nowrap">
            {estimation}
          </span>
        ) : (
          <>
            {hover ? (
              <>
                <Clock size={12} className="relative z-10 text-gray-600" />
                <span className="relative z-10 select-none text-gray-600 text-xs">
                  Estimer
                </span>
              </>
            ) : (
              <span className="relative z-10 select-none text-gray-500">-</span>
            )}
          </>
        )}
      </div>
      
      {hover && hasEstimation && (
        <CircleX
          size={12}
          onClick={handleDeleteEstimation}
          className="w-3 h-3 lg:w-4.5 lg:h-4.5 text-text-color-muted hover:text-danger-color"
        />
      )}
      {isEditing && (
        <FloatingMenu
          setIsOpen={setIsEditing}
          className="w-[320px] p-0"
          refs={refs}
          floatingStyles={floatingStyles}
        >
          <div className="rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-gray-300">
              <h3 className="font-medium text-sm text-black">Estimation du temps</h3>
            </div>
            
            {/* Quick options */}
            <div className="p-3">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <span
                  className="text-xs p-2 select-none rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  onClick={handleUpdateTaskEstimate}
                >
                  15 minutes
                </span>
                <span
                  className="text-xs p-2 select-none rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  onClick={handleUpdateTaskEstimate}
                >
                  30 minutes
                </span>
                <span
                  className="text-xs p-2 select-none rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  onClick={handleUpdateTaskEstimate}
                >
                  45 minutes
                </span>
                <span
                  className="text-xs p-2 select-none rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  onClick={handleUpdateTaskEstimate}
                >
                  1 heure
                </span>
                <span
                  className="text-xs p-2 select-none rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  onClick={handleUpdateTaskEstimate}
                >
                  2 heures
                </span>
                <span
                  className="text-xs p-2 select-none rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer font-medium"
                  onClick={handleUpdateTaskEstimate}
                >
                  1 jour
                </span>
              </div>
              
              {/* Custom estimation form */}
              <div className="border-t border-gray-300 pt-3">
                <form
                  className="flex items-center flex-row gap-2 "
                  onSubmit={handleCustomeEstimation}
                >
                  <div className="flex items-center gap-1 flex-1">
                    <input
                      type="number"
                      id="number"
                      name="number"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      step={0.1}
                      min={1}
                      max={99}
                      className="w-16 px-2 py-1 text-sm  border border-gray-300 rounded text-center focus:border-accent-color focus:outline-none"
                      placeholder="1"
                    />
                    <select
                      onChange={(e) => setWeek(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm  border border-gray-300 rounded focus:border-accent-color focus:outline-none"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="heures">Heures</option>
                      <option value="jours">Jours</option>
                      <option value="semaines">Semaines</option>
                    </select>
                  </div>
                  {number >= 1 && (
                    <button
                      className="text-sm px-3 py-1 border  text-white hover:bg-accent-color hover:text-white rounded transition-colors"
                      type="submit"
                    >
                      Valider
                    </button>
                  )}
                </form>
              </div>
            </div>
          </div>
        </FloatingMenu>
      )}
    </div>
  );
}
