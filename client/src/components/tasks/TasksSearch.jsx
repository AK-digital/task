import styles from "@/styles/components/tasks/tasks-search.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export default function TasksSearch({ setQueries }) {
  function handleSearch(e) {
    const value = e.target.value;
    deboucedSearch(value);
  }

  const deboucedSearch = useDebouncedCallback((value) => {
    setQueries((prevQueries) => ({
      ...prevQueries,
      search: value,
    }));
  }, 600);

  return (
    <div className={styles.container}>
      <Search size={24} />
      <input
        type="search"
        name="search"
        id="search"
        placeholder="Recherchez une tâche..."
        onChange={handleSearch}
        className={bricolageGrostesque.className}
      />
    </div>
  );
}
