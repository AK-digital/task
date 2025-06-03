"use client";
import { isNotEmpty } from "@/utils/utils";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

// Options is an array of objects, which contains the following properties:
// - id: string
// - label: string
export function Dropdown({ defaultValue, selected, options, query }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queries = new URLSearchParams(searchParams);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectOption = (e, option) => {
    const isChecked = e.target.checked;
    const hasQuery = queries.has(query);

    if (isChecked) {
      // Ajouter une valeur à la query
      if (hasQuery) {
        queries.set(query, `${queries.get(query)},${option?.label}`);
      } else {
        queries.set(query, option?.label);
      }
    } else {
      // Supprimer la valeur de la query
      const updatedQuery = queries
        .get(query)
        .split(",")
        .filter((name) => name !== option?.label)
        .join(",");

      // If query is projectId and empty then delete every queries
      if (query === "projects" && !updatedQuery) {
        queries.delete("projects");
        queries.delete("users");
        queries.delete("startingDate");
        queries.delete("endingDate");
      }

      // Si la query est vide, on la supprime complètement
      // Sinon, on met à jour la query avec la nouvelle valeur
      if (updatedQuery) {
        queries.set(query, updatedQuery);
      } else {
        queries.delete(query); // Supprime complètement la query si elle est vide
      }
    }

    router.replace(`${pathname}?${queries.toString()}`);
  };

  return (
    <>
      <div className={`relative text-center text-text-color-muted select-none ${isOpen ? "z-[9999]" : ""}`} data-active={isOpen}>
        <div onClick={() => setIsOpen(!isOpen)} className="relative flex justify-center items-center bg-secondary py-1.5 px-0 h-[35px] w-[180px] gap-1 rounded-3xl text-normal transition-all duration-[120ms] ease-ease-linear text-text-dark-color cursor-pointer hover:shadow-small">
          {isNotEmpty(selected) ? (
            selected.slice(0, 4).map((element, idx) => {
              if (selected.length > 1) {
                return (
                  <span className="span_Dropdown" key={`${element?.id}-${idx}`}>
                    <Image
                      src={
                        element?.logo || element?.picture || "/default-pfp.webp"
                      }
                      alt={element?.name || element?.label || "Logo"}
                      width={24}
                      height={24}
                      className="rounded-full max-h-6 min-h-6 min-w-6 object-cover"
                    />
                  </span>
                );
              } else {
                return (
                  <span className="span_Dropdown" key={`${element?.id}-${idx}`}>
                    <Image
                      src={
                        element?.logo || element?.picture || "/default-pfp.webp"
                      }
                      alt={element?.name || element?.label || "Logo"}
                      width={22}
                      height={22}
                      className="rounded-full max-w-[22px] max-h-[22px] w-[22px] h-[22px]"
                    />
                    {element?.name || element?.label}
                  </span>
                );
              }
            })
          ) : (
            <span className="span_Dropdown">{defaultValue}</span>
          )}
          {selected.length > 4 && (
            <span className="span_Dropdown justify-center min-w-6 min-h-6 bg-primary rounded-full text-small">+{selected.length - 4}</span>
          )}
          <span className={`span_Dropdown absolute right-2 transition-all duration-200 ease-linear ${isOpen ? "rotate-180" : ""}`}>
            <ChevronDown size={16} />
          </span>
        </div>
        {/* List */}
        {isOpen && (
          <div className="absolute z-999 top-10 left-0 w-full bg-secondary text-small rounded-lg max-h-[200px] overflow-auto text-left shadow-medium">
            {options?.map((option) => {
              return (
                <div className="flex items-center gap-1 cursor-pointer transition-all duration-150 ease-in-out px-1.5 hover:bg-third" key={option?.id}>
                  <input
                    type="checkbox"
                    name="projects"
                    id={`project-${option?.id}`}
                    className="w-3.5"
                    defaultValue={option?.id}
                    defaultChecked={queries.get(query)?.includes(option?.label)}
                    onChange={(e) => {
                      handleSelectOption(e, option);
                    }}
                  />
                  <label
                    htmlFor={`project-${option?.id}`}
                    className="flex items-center gap-1 cursor-pointer w-full h-full py-1.5 overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    <Image
                      src={
                        option?.picture
                          ? option.picture
                          : query === "users"
                          ? "/default-pfp.webp"
                          : "/default-project-logo.webp"
                      }
                      alt={option?.label || "Logo"}
                      width={20}
                      height={20}
                      quality={100}
                      className="rounded-full max-h-[20px] min-h-[20px] min-w-[20px] object-cover"
                    />
                    <span className="w-full overflow-hidden text-ellipsis whitespace-nowrap">{option?.label}</span>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isOpen && (
        <div className="modal-layout-opacity" onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
}
