import { useState } from "react";
import styles from "@/styles/components/modals/ia-project-modal.module.css";
import { getTasks } from "@/api/task";
import { createBoard } from "@/actions/board";
import { saveTask } from "@/actions/task";

export default function AddBoardIAModal({ project, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [selectedBoards, setSelectedBoards] = useState([]); // [{name, tasks: [bool]}]
  const [accepting, setAccepting] = useState(false);
  const [allChecked, setAllChecked] = useState(true);

  // Génère le prompt à partir des données projet et tâches
  async function buildPrompt() {
    let base = `Titre du projet : ${project?.name || ""}\n`;
    if (project?.note) base += `Notes : ${project.note}\n`;
    // Récupérer toutes les tâches existantes
    const tasks = await getTasks({ projectId: project?._id });
    if (tasks && tasks.length > 0) {
      base += `Tâches existantes :\n`;
      for (const t of tasks) {
        base += `- ${t.text}\n`;
      }
    } else {
      base += `Tâches existantes : aucune\n`;
    }
    base += `\nGénère jusqu'à 5 nouveaux tableaux (groupes de tâches) et 50 tâches maximum, pertinents et non redondants, pour enrichir ce projet. Ne propose que des tâches et tableaux nouveaux, différents de ceux déjà listés. Réponds en JSON structuré : { \"boards\": [ { \"name\": \"...\", \"tasks\": [\"...\", ...] }, ... ] }`;
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
      if (!res.ok) throw new Error("Erreur lors de la génération IA");
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
          throw new Error(boardRes.message || "Erreur création board");
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
    <div className={styles.overlay}>
      <div className={styles.modal} style={{ zIndex: 2002, left: '50%', top: '50%', transform: 'translate(-50%, -50%)', position: 'fixed' }}>
        <button className={styles.close} onClick={onClose}>&times;</button>
        <h2>Ajout de tableau par IA</h2>
        <p>Proposez des tableaux et tâches supplémentaires pertinents à partir du contexte du projet.</p>
        <textarea
          className={styles.textarea}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={8}
          disabled={true}
        />
        <button
          className={styles.generate}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Génération..." : "Générer avec l'IA"}
        </button>
        {error && <div className={styles.error}>{error}</div>}
        {result && result.boards && (
          <div className={styles.result}>
            <h3 style={{ textAlign: 'left', marginBottom: 12 }}>Suggestions IA</h3>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={allChecked}
                onChange={handleToggleAll}
                style={{ marginRight: 8 }}
              />
              <span style={{ fontWeight: 500 }}>Tout cocher/décocher</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, textAlign: 'left' }}>
              {result.boards.map((board, i) => (
                <li key={i} style={{ marginBottom: 16 }}>
                  <label style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8, textAlign: 'left' }}>
                    <span className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        checked={selectedBoards[i]?.checked || false}
                        onChange={() => handleToggleBoard(i)}
                      />
                    </span>
                    {board.name}
                  </label>
                  <ul style={{ marginLeft: 24, marginTop: 6, textAlign: 'left' }}>
                    {board.tasks.map((task, j) => (
                      <li key={j} style={{ display: "flex", alignItems: "center", gap: 8, textAlign: 'left' }}>
                        <span className={styles.checkboxContainer}>
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
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button
                className={styles.generate}
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting ? "Ajout en cours..." : "Accepter la sélection"}
              </button>
              <button
                className={styles.generate}
                onClick={handleToggleAll}
                disabled={accepting}
                style={{ background: "#b3cdfa", color: "#222" }}
              >
                {allChecked ? "Tout décocher" : "Tout cocher"}
              </button>
              <button
                className={styles.generate}
                onClick={onClose}
                disabled={accepting}
                style={{ background: "#eee", color: "#222" }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
      <div className={styles.backdrop} style={{ zIndex: 2001 }} onClick={onClose}></div>
    </div>
  );
} 