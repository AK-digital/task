"use client";
import styles from "@/styles/components/dropdown/more.module.css";
import Link from "next/link";
import React from "react";

export function MoreMenu({ isOpen, setIsOpen, options }) {
  const handleIsOpen = () => {
    setIsOpen((prev) => !prev);
  };

  function content(option) {
    return (
      <span>
        {option?.icon}
        {option?.name}
      </span>
    );
  }

  function itemProps(option) {
    const props = {
      className: styles.option,
      onClick: option?.function,
      "data-remove": option?.remove,
    };

    return props;
  }

  return (
    <>
      <div className={styles.container} id="popover">
        {isOpen && (
          <ul className={styles.options}>
            {options.map((option, idx) => {
              if (option?.authorized === false) return null;

              return (
                <li {...itemProps(option)} key={idx}>
                  {option?.link ? (
                    <Link href={option?.link} className={styles.link}>
                      {content(option)}
                    </Link>
                  ) : (
                    content(option)
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {isOpen && <div id="modal-layout-opacity" onClick={handleIsOpen}></div>}
    </>
  );
}
