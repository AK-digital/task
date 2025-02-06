import styles from "@/styles/components/tasks/task-dropdown.module.css";
import { useState } from "react";

export default function TaskDropdown({ current, values, type, form }) {
  const [isOpen, setIsOpen] = useState(false);

  async function handleUpdateTask(e) {
    e.preventDefault();
    const value = e.target.dataset.value;

    // await updateTask(taskId, projectId, {
    //   [type]: value,
    // });

    form.current.requestSubmit();

    setIsOpen(false);
  }

  return (
    <div className={styles["dropdown"]}>
      <select name="pets" id="pet-select">
        <option value={current}>--Please choose an option--</option>
        <option value="dog">Dog</option>
        <option value="cat">Cat</option>
        <option value="hamster">Hamster</option>
        <option value="parrot">Parrot</option>
        <option value="spider">Spider</option>
        <option value="goldfish">Goldfish</option>
      </select>
    </div>
  );
}
