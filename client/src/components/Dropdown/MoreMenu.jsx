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
      onClick: option?.function,
      "data-remove": option?.remove,
    };

    return props;
  }

  return (
    <>
      <div className="top-3 left-[18px] w-max text-text-size-small py-2 px-4 shadow-shadow-box-small text-text-color-dark no-underline [&_a]:text-red-500 [&_a]:no-underline " id="popover">
        {isOpen && (
          <ul>
            {options.map((option, idx) => {
              if (option?.authorized === false) return null;

              return (
                <li {...itemProps(option)} key={idx} className="option cursor-pointer py-2 border-b border-background-primary-color hover:text-text-accent-color last:border-b-0 data-[remove=true]:text-text-color-red hover:[&_a]:text-text-accent-color [&_span]:flex [&_span]:items-center [&_span]:gap-2 ">
                  {option?.link ? (
                    <Link href={option?.link}>
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
      {isOpen && <div className="modal-layout-opacity" onClick={handleIsOpen}></div>}
    </>
  );
}
