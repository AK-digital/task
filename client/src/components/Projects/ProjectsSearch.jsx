import { Search } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

export default function ProjectsSearch({ setQueries }) {
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
    <div className="container_ProjectsSearch flex items-center gap-2 p-1 w-full max-w-[250px] transition-all duration-150 ease-in-out border-b border-color-border-color">
      <Search size={24} />
      <input
        type="search"
        name="search"
        id="search"
        placeholder="Recherchez un projet"
        onChange={handleSearch}
        className="input_ProjectsSearch border-0 p-0 text-color-text-dark-color text-normal font-bricolage placeholder:text-color-text-color-muted"
      />
    </div>
  );
} 