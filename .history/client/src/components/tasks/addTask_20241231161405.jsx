"use client"

import { useActionState } from "react";

export default function AddTask() {
     const saveTaskWithProjectId = saveTask.bind(null, projectId);
  const [state, formAction, pending] = useActionState(
    saveTaskWithProjectId,
    initialState
  );
  const [isWritting, setIsWritting] = useState(false);
    return (

    )
}