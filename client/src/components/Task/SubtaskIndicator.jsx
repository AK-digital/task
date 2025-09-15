"use client";
import { useState, useEffect } from "react";
import { CheckSquare } from "lucide-react";
import { getSubtasks } from "@/api/subtask";

export default function SubtaskIndicator({ task }) {
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    loadSubtasks();
  }, [task._id]);

  const loadSubtasks = async () => {
    try {
      const response = await getSubtasks(task._id);
      if (response.success) {
        setSubtasks(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des sous-tâches:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || subtasks.length === 0) {
    return null;
  }

  const completedCount = subtasks.filter(sub => sub.completed).length;
  const totalCount = subtasks.length;
  const allCompleted = completedCount === totalCount;

  return (
    <div className="flex items-center gap-1 text-xs">
      <CheckSquare 
        size={12} 
        className={allCompleted ? "text-green-600" : "text-gray-500"} 
      />
      <span className={`${allCompleted ? "text-green-600" : "text-gray-500"}`}>
        {completedCount}/{totalCount}
      </span>
    </div>
  );
}
