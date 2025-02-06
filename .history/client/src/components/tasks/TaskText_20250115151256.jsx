import { updateTaskText } from "@/actions/task";
import { useState } from "react";

export default function TaskText({ task }) {
  const formRef = useRef(null);
  const [inputValue, setInputValue] = useState(task?.text || "");
  const updateTaskTextWithIds = updateTaskText.bind(
    null,
    task?._id,
    task?.projectId
  );
  const [state, formAction, pending] = useActionState(
    updateTaskTextWithIds,
    initialState
  );

  // Créer un callback avec un délai de 300ms
  const debouncedUpdateTask = useDebouncedCallback(async (value) => {
    formRef.current.requestSubmit();
  }, 600);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    debouncedUpdateTask(value);
  };

  return (
    <div className={styles.container}>
      <form action={formAction} ref={formRef}>
        <input
          type="text"
          name="text"
          id="text"
          value={inputValue}
          onChange={handleChange}
        />
      </form>
    </div>
  );
}
