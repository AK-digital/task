import { useState } from "react";

export default function TaskText({ task }) {
  const [inputValue, setInputValue] = useState(task?.text || "");

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
