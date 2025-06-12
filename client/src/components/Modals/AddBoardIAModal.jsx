import React, { useEffect, useState } from "react";
import { getTasks } from "@/api/task";
import { createBoard } from "@/actions/board";
import { saveTask } from "@/actions/task";
import { useTranslation } from "react-i18next";

export default function AddBoardIAModal({ project, onClose }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [selectedBoards, setSelectedBoards] = useState([]); // [{name, tasks: [bool]}]
  const [accepting, setAccepting] = useState(false);
  const [allChecked, setAllChecked] = useState(true);

  // Génère le prompt à partir des données projet et tâches
  async function buildPrompt() {
    let base = `${t("boards.ai_prompt_project_title")} ${
      project?.name || ""
    }\n`;
    if (project?.note)
      base += `${t("boards.ai_prompt_notes")} ${project.note}\n`;
    // Récupérer toutes les tâches existantes
    const tasks = await getTasks({ projectId: project?._id });
    if (tasks && tasks.length > 0) {
      base += `${t("boards.ai_prompt_existing_tasks")}\n`;
      for (const t of tasks) {
        base += `- ${t.text}\n`;
      }
    } else {
      base += `${t("boards.ai_prompt_no_tasks")}\n`;
    }
    base += `\n${t("boards.ai_prompt_instruction")}`;
    return base;
  }

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fullPrompt = await buildPrompt();
      setPrompt(fullPrompt); // Affiche le prompt généré dans le textarea
      const res = await fetch("/api/ai/generate-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      if (!res.ok) throw new Error(t("boards.ai_generation_error"));
      const data = await res.json();
      setResult(data);
      // Initialiser la sélection (tout coché par défaut)
      if (data?.boards) {
        setSelectedBoards(
          data.boards.map((b) => ({
            name: b.name,
            checked: true,
            tasks: b.tasks.map(() => true),
          }))
        );
        setAllChecked(true);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBoard = (i) => {
    setSelectedBoards((prev) => {
      const updated = prev.map((b, idx) =>
        idx === i
          ? {
              ...b,
              checked: !b.checked,
              tasks: b.tasks.map(() => !b.checked),
            }
          : b
      );
      setAllChecked(updated.every((b) => b.checked && b.tasks.every((t) => t)));
      return updated;
    });
  };

  const handleToggleTask = (i, j) => {
    setSelectedBoards((prev) => {
      const updated = prev.map((b, idx) =>
        idx === i
          ? {
              ...b,
              tasks: b.tasks.map((t, k) => (k === j ? !t : t)),
              checked: b.tasks.map((t, k) => (k === j ? !t : t)).every(Boolean),
            }
          : b
      );
      setAllChecked(updated.every((b) => b.checked && b.tasks.every((t) => t)));
      return updated;
    });
  };

  const handleAccept = async () => {
    if (!result?.boards) return;
    setAccepting(true);
    setError(null);
    try {
      for (let i = 0; i < result.boards.length; i++) {
        if (!selectedBoards[i]?.checked) continue;
        const board = result.boards[i];
        const boardRes = await createBoard(project._id, board.name);
        if (!boardRes.success || !boardRes.data?._id) {
          throw new Error(
            boardRes.message || t("boards.ai_board_creation_error")
          );
        }
        const boardId = boardRes.data._id;
        for (let j = 0; j < board.tasks.length; j++) {
          if (!selectedBoards[i].tasks[j]) continue;
          const taskForm = new FormData();
          taskForm.set("board-id", boardId);
          taskForm.set("new-task", board.tasks[j]);
          await saveTask(project._id, {}, taskForm);
        }
      }
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setAccepting(false);
    }
  };

  const handleToggleAll = () => {
    setSelectedBoards((prev) => {
      const newChecked = !allChecked;
      return prev.map((b) => ({
        ...b,
        checked: newChecked,
        tasks: b.tasks.map(() => newChecked),
      }));
    });
    setAllChecked((prev) => !prev);
  };

  return (
    <div className="fixed top-0 left-0 w-screen h-screen z-[2000]">
      <div
        className="fixed top-0 left-0 w-screen h-screen bg-black/[0.18] z-[2001]"
        onClick={onClose}
      ></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-secondary rounded-xl shadow-[2px_2px_8px_var(--foreground)] p-8 z-[2002] min-w-[350px] max-w-[95vw] min-h-[200px] max-h-[80vh] overflow-y-auto flex flex-col gap-5 text-text-dark-color">
        <button
          className="absolute top-4 right-4 bg-none border-none text-2xl cursor-pointer text-text-color-muted transition-colors duration-200 hover:text-accent-color"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-semibold mb-1">
          {t("boards.add_board_ia")}
        </h2>
        <p className="text-lg text-text-color-muted mb-2">
          {t("boards.ai_modal_description")}
        </p>
        <textarea
          className="w-full min-h-[80px] rounded-lg border border-border-color p-3 text-base resize-y bg-[#efece0] text-text-dark-color mb-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          disabled={true}
        />
        <button
          className="bg-accent-color text-white border-2 border-accent-color rounded-lg py-3 px-6 text-base cursor-pointer mt-2 transition-all duration-200 font-medium shadow-none disabled:bg-[#c7c7c7] disabled:border-[#c7c7c7] disabled:text-text-color-muted disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? t("boards.ai_generating") : t("boards.ai_generate_button")}
        </button>
        {error && (
          <div className="text-[#c00] bg-[#ffeaea] rounded-md p-2 mt-2 text-sm">
            {error}
          </div>
        )}
        {result && result.boards && (
          <div className="mt-6 bg-secondary rounded-small shadow-none p-6 flex flex-col gap-4 border-[1.5px] border-border-color text-left">
            <h3 className="text-left mb-3">{t("boards.ai_suggestions")}</h3>
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleToggleAll}
                className="mr-2"
              />
              <span className="font-medium">{t("boards.ai_toggle_all")}</span>
            </div>
            <ul className="list-none p-0 text-left">
              {result.boards.map((board, i) => (
                <li key={i} className="mb-4">
                  <label className="font-semibold flex items-center gap-2 text-left">
                    <span className="w-15 min-w-10 max-w-15 flex items-center justify-start mr-2">
                      <input
                        type="checkbox"
                        checked={selectedBoards[i]?.checked || false}
                        onChange={() => handleToggleBoard(i)}
                      />
                    </span>
                    {board.name}
                  </label>
                  <ul className="ml-6 mt-1.5 text-left">
                    {board.tasks.map((task, j) => (
                      <li key={j} className="flex items-center gap-2 text-left">
                        <span className="w-15 min-w-10 max-w-15 flex items-center justify-start mr-2">
                          <input
                            type="checkbox"
                            checked={selectedBoards[i]?.tasks[j] || false}
                            onChange={() => handleToggleTask(i, j)}
                          />
                        </span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
            <div className="flex gap-3 mt-4">
              <button
                className="bg-accent-color text-white border-2 border-accent-color rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-medium shadow-none disabled:bg-[#c7c7c7] disabled:border-[#c7c7c7] disabled:text-text-color-muted disabled:cursor-not-allowed"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting
                  ? t("boards.ai_adding")
                  : t("boards.ai_accept_selection")}
              </button>
              <button
                className="bg-[#b3cdfa] text-[#222] border-2 border-[#b3cdfa] rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-medium shadow-none disabled:bg-[#c7c7c7] disabled:border-[#c7c7c7] disabled:text-text-color-muted disabled:cursor-not-allowed"
                onClick={handleToggleAll}
                disabled={accepting}
              >
                {allChecked
                  ? t("boards.ai_uncheck_all")
                  : t("boards.ai_check_all")}
              </button>
              <button
                className="bg-[#eee] text-[#222] border-2 border-[#eee] rounded-lg py-3 px-6 text-base cursor-pointer transition-all duration-200 font-medium shadow-none disabled:bg-[#c7c7c7] disabled:border-[#c7c7c7] disabled:text-text-color-muted disabled:cursor-not-allowed"
                onClick={onClose}
                disabled={accepting}
              >
                {t("common.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
