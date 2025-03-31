"use client";
import styles from "@/styles/components/dropdown/dropdown.module.css";
import { isNotEmpty } from "@/utils/utils";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
        queries.set(query, `${queries.get(query)} ${option?.id}`);
      } else {
        queries.set(query, option?.id);
      }
    } else {
      // Supprimer la valeur de la query
      const updatedQuery = queries
        .get(query)
        .split(" ")
        .filter((id) => id !== option?.id)
        .join(" ");

      // If query is projectId and empty then delete every queries
      if (query === "projectId" && !updatedQuery) {
        queries.delete("projectId");
        queries.delete("userId");
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

    router.push(`${pathname}?${queries.toString()}`);
  };

  return (
    <>
      <div className={styles.container} data-active={isOpen}>
        <div onClick={() => setIsOpen(!isOpen)} className={styles.current}>
          {isNotEmpty(selected) ? (
            selected.slice(0, 4).map((element, idx) => {
              if (selected.length > 1) {
                return (
                  <span key={`${element?.id}-${idx}`}>
                    <Image
                      src={
                        element?.logo || element?.picture || "/default-pfp.webp"
                      }
                      alt={element?.name || element?.label || "Logo"}
                      width={24}
                      height={24}
                      style={{ borderRadius: "50%", minWidth: "24px" }}
                    />
                  </span>
                );
              } else {
                return (
                  <span key={`${element?.id}-${idx}`}>
                    <Image
                      src={
                        element?.logo || element?.picture || "/default-pfp.webp"
                      }
                      alt={element?.name || element?.label || "Logo"}
                      width={22}
                      height={22}
                      style={{ borderRadius: "50%" }}
                    />
                    {element?.name || element?.label}
                  </span>
                );
              }
            })
          ) : (
            <span>{defaultValue}</span>
          )}
          {selected.length > 4 && (
            <span className={styles.count}>+{selected.length - 4}</span>
          )}
        </div>
        {/* List */}
        {isOpen && (
          <div className={styles.options}>
            {options?.map((option) => {
              return (
                <div className={styles.option} key={option?.id}>
                  <input
                    type="checkbox"
                    name="projects"
                    id={`project-${option?.id}`}
                    className={styles.checkbox}
                    defaultValue={option?.id}
                    defaultChecked={queries.get(query)?.includes(option?.id)}
                    onChange={(e) => {
                      handleSelectOption(e, option);
                    }}
                  />
                  <label
                    htmlFor={`project-${option?.id}`}
                    className={styles.label}
                  >
                    <Image
                      src={option?.picture || "/default-pfp.webp"}
                      alt={option?.label || "Logo"}
                      width={20}
                      height={20}
                      quality={100}
                      style={{
                        borderRadius: "50%",
                        objectFit: "cover",
                        minWidth: "20px",
                        minHeight: "20px",
                      }}
                    />
                    <span>{option?.label}</span>
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {isOpen && (
        <div id="modal-layout-opacity" onClick={() => setIsOpen(false)}></div>
      )}
    </>
  );
}
