import { useState } from "react";
import { saveProject } from "@/actions/project";
import { createBoard } from "@/actions/board";
import { saveTask } from "@/actions/task";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function IAProjectModal({ onClose }) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/ai/generate-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!res.ok) throw new Error(t("createProject.generationError"));
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!result?.title || !Array.isArray(result?.boards)) return;
    setCreating(true);
    setCreateError(null);
    try {
      // 1. Créer le projet
      const formData = new FormData();
      formData.set("project-name", result.title);
      const projectRes = await saveProject({}, formData);
      if (projectRes.status !== "success" || !projectRes.data?._id) {
        const errorMessage = projectRes.message?.startsWith?.("project.")
          ? t(projectRes.message)
          : projectRes.message;
        throw new Error(
          errorMessage || t("createProject.projectCreationError")
        );
      }
      const projectId = projectRes.data._id;
      // 2. Créer les boards et les tâches
      for (const board of result.boards) {
        const boardRes = await createBoard(projectId, board.name);
        if (!boardRes.success || !boardRes.data?._id) {
          const errorMessage = boardRes.message?.startsWith?.("board.")
            ? t(boardRes.message)
            : boardRes.message;
          throw new Error(
            errorMessage || t("createProject.boardCreationError")
          );
        }
        const boardId = boardRes.data._id;
        // 3. Créer les tâches
        for (const task of board.tasks) {
          const taskForm = new FormData();
          taskForm.set("board-id", boardId);
          taskForm.set("new-task", task);
          const taskRes = await saveTask(projectId, {}, taskForm);
          if (!taskRes.success) {
            const errorMessage = taskRes.message?.startsWith?.("task.")
              ? t(taskRes.message)
              : taskRes.message;
            console.warn("Failed to create task:", errorMessage);
          }
        }
      }
      // Redirige vers le projet créé
      router.push(`/projects/${projectId}`);
      onClose();
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
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
          {t("createProject.title")}
        </h2>
        <p className="text-lg text-text-color-muted mb-2">
          {t("createProject.description")}
        </p>
        <textarea
          className="w-full min-h-[80px] rounded-lg border border-border-color p-3 text-base resize-y bg-[#efece0] text-text-dark-color mb-2"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={t("createProject.placeholder")}
          rows={4}
          disabled={loading || creating}
        />
        <button
          className="bg-accent-color text-white border-2 border-accent-color rounded-lg py-3 px-6 text-base cursor-pointer mt-2 transition-all duration-200 font-medium shadow-none disabled:bg-[#c7c7c7] disabled:border-[#c7c7c7] disabled:text-text-color-muted disabled:cursor-not-allowed"
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || creating}
        >
          {loading
            ? t("createProject.generating")
            : t("createProject.generateButton")}
        </button>
        {error && (
          <div className="text-[#c00] bg-[#ffeaea] rounded-md p-2 mt-2 text-sm">
            {error}
          </div>
        )}
        {result && (
          <div className="mt-6 bg-secondary rounded-small shadow-none p-6 flex flex-col gap-4 border-[1.5px] border-border-color text-left">
            <h3 className="text-left mb-3">
              {t("createProject.suggestionsTitle")}
            </h3>
            <div>
              <b className="text-accent-color text-lg">
                {t("createProject.projectName")}:
              </b>{" "}
              {result.title}
            </div>
            {result.boards?.map((board, i) => (
              <div key={i} className="mt-3">
                <b className="text-accent-color text-lg">{board.name}</b>
                <ul className="pl-0 mt-2 flex flex-col gap-2 text-left">
                  {board.tasks?.map((task, j) => (
                    <li
                      key={j}
                      className="mb-0 text-normal text-text-dark-color font-light bg-none border-none p-0 text-left"
                    >
                      {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <button
              className="bg-accent-color text-white border-2 border-accent-color rounded-lg py-3 px-6 text-base cursor-pointer mt-4 transition-all duration-200 font-medium shadow-none disabled:bg-[#c7c7c7] disabled:border-[#c7c7c7] disabled:text-text-color-muted disabled:cursor-not-allowed"
              onClick={handleCreateProject}
              disabled={creating}
            >
              {creating
                ? t("createProject.creating")
                : t("createProject.createButton")}
            </button>
            {createError && (
              <div className="text-[#c00] bg-[#ffeaea] rounded-md p-2 mt-2 text-sm">
                {createError}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
