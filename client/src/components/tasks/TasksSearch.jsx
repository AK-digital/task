import { Search } from "lucide-react";
import { memo, useCallback } from "react";
import { useOptimizedDebounce } from "@/hooks/useOptimizedDebounce";

const TasksSearch = memo(function TasksSearch({ setQueries }) {
  const updateSearch = useCallback((value) => {
    setQueries((prevQueries) => ({
      ...prevQueries,
      search: value || null,
    }));
  }, [setQueries]);

  const debouncedSearch = useOptimizedDebounce(updateSearch, 400);

  const handleSearch = useCallback((e) => {
    const value = e.target.value.trim();
    debouncedSearch(value);
  }, [debouncedSearch]);

  return (
    <div className="container_TasksSearch flex items-center gap-3 py-1 w-full max-w-[200px] transition-all duration-150 ease-in-out border-b border-color-border-color">
      <Search size={24} />
      <input
        type="search"
        name="search"
        id="search"
        placeholder="Recherchez une tâche"
        onChange={handleSearch}
        className="input_TasksSearch border-0 p-0 text-color-text-dark-color text-[14px] font-bricolage placeholder:text-color-text-color-muted"
      />
    </div>
  );
});

export default TasksSearch;
