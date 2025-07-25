"use client";
import { updateTaskEstimate } from "@/api/task";
import { useUserRole } from "../../../hooks/useUserRole";
import { getFloating, usePreventScroll } from "@/utils/floating";
import socket from "@/utils/socket";
import { XCircle } from "lucide-react";
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
      className="hidden lg:flex relative justify-center items-center py-1 px-1 xl:px-2 border-r border-text-light-color min-w-[80px] xl:min-w-[100px] max-w-[120px] w-full h-full gap-0.5 flex-shrink-0"
      onMouseEnter={handleHover}
      onMouseLeave={() => setHover(false)}
    >
      <div
        data-estimation={hasEstimation}
        onClick={handleIsEditing}
        ref={refs.setReference}
        className="bg-primary py-1 px-0.5 rounded-2xl text-xs xl:text-small w-full text-center cursor-pointer font-semibold data-[estimation=false]:text-text-dark-color"
      >
        <span className="select-none">{estimation}</span>
      </div>
      {hover && hasEstimation && (
        <div
          className="relative top-0.5 cursor-pointer"
          onClick={handleDeleteEstimation}
        >
          <XCircle size={14} className="hover:text-danger-color" />
        </div>
      )}
      {isEditing && (
        <FloatingMenu
          setIsOpen={setIsEditing}
          className="w-[305px] p-2"
          refs={refs}
          floatingStyles={floatingStyles}
        >
          <div className="flex justify-center flex-wrap gap-2">
            <span
              className="p-1.5 rounded-2xl text-small w-full text-center cursor-pointer font-semibold flex justify-center items-center gap-1 transition-colors duration-200 bg-third min-w-[90px] max-w-[90px] hover:bg-primary select-none"
              onClick={handleUpdateTaskEstimate}
            >
              15 minutes
            </span>
            <span
              className="p-1.5 rounded-2xl text-small w-full text-center cursor-pointer font-semibold flex justify-center items-center gap-1 transition-colors duration-200 bg-third min-w-[90px] max-w-[90px] hover:bg-primary select-none"
              onClick={handleUpdateTaskEstimate}
            >
              30 minutes
            </span>
            <span
              className="p-1.5 rounded-2xl text-small w-full text-center cursor-pointer font-semibold flex justify-center items-center gap-1 transition-colors duration-200 bg-third min-w-[90px] max-w-[90px] hover:bg-primary select-none"
              onClick={handleUpdateTaskEstimate}
            >
              45 minutes
            </span>
            <span
              className="p-1.5 rounded-2xl text-small w-full text-center cursor-pointer font-semibold flex justify-center items-center gap-1 transition-colors duration-200 bg-third min-w-[90px] max-w-[90px] hover:bg-primary select-none"
              onClick={handleUpdateTaskEstimate}
            >
              1 heure
            </span>
            <span
              className="p-1.5 rounded-2xl text-small w-full text-center cursor-pointer font-semibold flex justify-center items-center gap-1 transition-colors duration-200 bg-third min-w-[90px] max-w-[90px] hover:bg-primary select-none"
              onClick={handleUpdateTaskEstimate}
            >
              2 heures
            </span>
            <span
              className="p-1.5 rounded-2xl text-small w-full text-center cursor-pointer font-semibold flex justify-center items-center gap-1 transition-colors duration-200 bg-third min-w-[90px] max-w-[90px] hover:bg-primary select-none"
              onClick={handleUpdateTaskEstimate}
            >
              1 jour
            </span>
          </div>
          <div className="mt-2">
            <form
              className="flex items-center justify-between flex-row border-t border-text-light-color mt-3 pt-3"
              onSubmit={handleCustomeEstimation}
            >
              <div className="group flex flex-row gap-0">
                <input
                  type="number"
                  id="number"
                  name="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  step={0.1}
                  min={1}
                  max={99}
                  className="input_TaskEstimate font-bricolage cursor-pointer text-small text-text-dark-color font-semibold p-1.5 w-10 bg-third rounded-2xl rounded-tr-[inherit] rounded-br-[inherit] border-none text-center group-hover:bg-primary"
                />
                <select
                  name=""
                  id=""
                  onChange={(e) => setWeek(e.target.value)}
                  className="font-bricolage text-small text-text-dark-color cursor-pointer font-semibold bg-third outline-none border-none rounded-2xl rounded-tl-[inherit] rounded-bl-[inherit] group-hover:bg-primary"
                >
                  <option value="minutes">Minutes</option>
                  <option value="heures">Heures</option>
                  <option value="jours">Jours</option>
                  <option value="semaines">Semaines</option>
                </select>
              </div>
              {number >= 1 && (
                <div className="w-full">
                  <button
                    className="font-bricolage text-small font-normal p-1.5 w-full text-white"
                    type="submit"
                  >
                    Valider
                  </button>
                </div>
              )}
            </form>
          </div>
        </FloatingMenu>
      )}
    </div>
  );
}
