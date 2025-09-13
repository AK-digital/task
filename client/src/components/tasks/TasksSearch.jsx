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
    <div className="container_TasksSearch flex items-center gap-2 py-1 w-full max-w-[210px] transition-all duration-150 ease-in-out border-b border-color-border-color">
      <Search size={24} />
      <input
        type="search"
        name="search"
        id="search"
        placeholder="Recherchez une tâche"
        onChange={handleSearch}
        className="input_TasksSearch border-0 p-0 text-color-text-dark-color text-[15px] font-bricolage placeholder:text-color-text-color-muted"
      />
    </div>
  );
}
