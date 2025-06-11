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
    <div className="container_TasksSearch flex items-center gap-2 p-2 w-full max-w-[250px] transition-all duration-150 ease-in-out border-b border-color-border-color">
      <Search size={24} />
      <input
        type="search"
        name="search"
        id="search"
        placeholder={t("tasks.search_task_placeholder")}
        onChange={handleSearch}
        className="input_TasksSearch border-0 p-0 text-color-text-dark-color text-normal font-bricolage placeholder:text-color-text-color-muted"
      />
    </div>
  );
}
