import styles from "@/styles/components/tasks/tasks-search.module.css";
import { bricolageGrostesque } from "@/utils/font";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { useTranslation } from "react-i18next";

export default function TasksSearch({ setQueries }) {
  const { t } = useTranslation();

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
        placeholder={t("tasks.search_task_placeholder")}
        onChange={handleSearch}
        className={bricolageGrostesque.className}
      />
    </div>
  );
}
