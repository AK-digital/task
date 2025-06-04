"use client";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
import Portal from "../Portal/Portal";

export function MoreMenu({ isOpen, setIsOpen, options }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [deleteOption, setDeleteOption] = useState(null);

  const isProject = options.some((option) => option?.project);

  const handleIsOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClick = (option) => {
    if (option.remove) {
      setDeleteOption(option);
      setPendingAction(() => option.function);
      setConfirmOpen(true);
    } else {
      option.function?.();
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    pendingAction?.();
    setConfirmOpen(false);
    setIsOpen(false);
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
      <div className="absolute z-2001 bg-secondary rounded-lg top-[25px] -left-[13px] w-max text-small py-2 px-4 shadow-small text-text-dark-color no-underline [&_a]:text-text-dark-color [&_a]:no-underline ">
        {isOpen && (
          <ul>
            {options.map((option, idx) => {
              if (option?.authorized === false) return null;

              return (
                <li {...itemProps(option)} key={idx} className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light last:border-b-0 data-[remove=true]:text-text-color-red hover:[&_a]:text-accent-color-light [&_span]:flex [&_span]:items-center [&_span]:gap-2 ">
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
