"use client";
import { deleteTemplate, useTemplate } from "@/api/template";
import { List, ListTodo } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Template({ elt }) {
  const router = useRouter();

  const handleUseTemplate = async () => {
    const res = await useTemplate(elt?._id);

    if (res.success) {
      const projectId = res?.data?._id;
      router.push(`/projects/${projectId}`);
    }
  };

  const handleDelete = async () => {
    await deleteTemplate(elt?._id);
  };

  const hasDescription = elt?.description;
  return (
    <div className="flex items-center justify-between gap-3 bg-secondary py-1 px-3 rounded-lg">
      <div className="flex items-center gap-3">
        <div>
          <h3 className="text-large font-bold text-text-dark-color">
            {elt?.name}
          </h3>
        </div>
        {hasDescription && (
          <div>
            <p>{elt?.description}</p>
          </div>
        )}
        <div>
          <span className="flex items-center gap-1">
            <List size={16} />
            <span className="flex items-center gap-1">{elt?.boardsCount}</span>
          </span>
        </div>
        <div>
          <span className="flex items-center gap-1">
            <ListTodo size={16} />
            <span className="flex items-center gap-1">{elt?.tasksCount}</span>
          </span>
        </div>
      </div>
      <div>
        <button
          onClick={handleUseTemplate}
          className="bg-transparent text-accent-color"
        >
          Utiliser ce template
        </button>
        <button
          onClick={handleDelete}
          className="bg-transparent text-accent-color"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
