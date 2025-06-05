import { useState } from "react";
import styles from "@/styles/components/modals/ia-project-modal.module.css";
import { saveProject } from "@/actions/project";
import { createBoard } from "@/actions/board";
import { saveTask } from "@/actions/task";
import { useRouter } from "next/navigation";

export default function IAProjectModal({ onClose }) {
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
      if (!res.ok) throw new Error("Erreur lors de la génération IA");
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
        throw new Error(projectRes.message || "Erreur création projet");
      }
      const projectId = projectRes.data._id;
      // 2. Créer les boards et les tâches
      for (const board of result.boards) {
        const boardRes = await createBoard(projectId, board.name);
        if (!boardRes.success || !boardRes.data?._id) {
          throw new Error(boardRes.message || "Erreur création board");
        }
        const boardId = boardRes.data._id;
        // 3. Créer les tâches
        for (const task of board.tasks) {
          const taskForm = new FormData();
          taskForm.set("board-id", boardId);
          taskForm.set("new-task", task);
          await saveTask(projectId, {}, taskForm);
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
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.close} onClick={onClose}>&times;</button>
        <h2>Créer un projet grâce à l'IA</h2>
        <p>Décrivez votre projet, l'IA vous proposera des tâches et des groupes de tâches (tableaux) pertinents.</p>
        <textarea
          className={styles.textarea}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Décrivez votre projet ici..."
          rows={4}
          disabled={loading || creating}
        />
        <button
          className={styles.generate}
          onClick={handleGenerate}
          disabled={loading || !prompt.trim() || creating}
        >
          {loading ? "Génération..." : "Générer avec l'IA"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
        {result && (
          <div className={styles.result}>
            <h3>Suggestions IA</h3>
            <div><b>Nom du projet :</b> {result.title}</div>
            {result.boards?.map((board, i) => (
              <div key={i} style={{ marginTop: 12 }}>
                <b>{board.name}</b>
                <ul>
                  {board.tasks?.map((task, j) => (
                    <li key={j}>{task}</li>
                  ))}
                </ul>
              </div>
            ))}
            <button
              className={styles.generate}
              onClick={handleCreateProject}
              disabled={creating}
              style={{ marginTop: 16 }}
            >
              {creating ? "Création en cours..." : "Créer ce projet"}
            </button>
            {createError && <div className={styles.error}>{createError}</div>}
          </div>
        )}
      </div>
      <div className={styles.backdrop} onClick={onClose}></div>
    </div>
  );
} 