"use client";
import styles from "@/styles/components/dropdown/dropdown.module.css";
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

  const handleSelectOption = (option) => {
    setIsOpen(false);
    queries.set(query, option?.id);
    router.push(`${pathname}?${queries.toString()}`);
  };

  const removeFilter = () => {
    if (query === "projectId") {
      router.push(`${pathname.split("?")[0]}`);
    } else {
      queries.delete(query);
      router.push(`${pathname}?${queries.toString()}`);
    }
    setIsOpen(false);
  };

  return (
    <div className={styles.container}>
      <div onClick={() => setIsOpen(!isOpen)} className={styles.current}>
        {selected?.picture && (
          <Image
            src={selected?.picture}
            alt={selected?.label}
            width={22}
            height={22}
            style={{ borderRadius: "50%" }}
          />
        )}
        <span>{selected?.label || defaultValue || "Choisir une option"}</span>
      </div>
      {/* List */}
      {isOpen && (
        <div className={styles.options}>
          <div className={styles.option} onClick={removeFilter}>
            <span>Supprimer le filtre</span>
          </div>
          {options?.map((option) => {
            return (
              <div
                className={styles.option}
                key={option?.id}
                onClick={() => handleSelectOption(option)}
              >
                {option?.picture && (
                  <Image
                    src={option?.picture}
                    alt={option?.label}
                    width={22}
                    height={22}
                    style={{ borderRadius: "50%" }}
                  />
                )}
                <span>{option?.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
