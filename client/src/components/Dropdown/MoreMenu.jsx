"use client";
import Link from "next/link";
import React from "react";
import { useState, useEffect } from "react";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
import Portal from "../Portal/Portal";

export function MoreMenu({ isOpen, setIsOpen, options, triggerRef }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [deleteOption, setDeleteOption] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const isProject = options.some((option) => option?.project);

  useEffect(() => {
    if (isOpen && triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 13,
      });
    }
  }, [isOpen, triggerRef]);

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
      onClick: () => handleClick(option),
      "data-remove": option?.remove,
    };
    return props;
  }

  return (
    <>
      {isOpen && (
        <Portal>
          <div
            className="fixed z-20001 bg-secondary rounded-lg w-max text-small py-2 px-4 shadow-xl text-text-dark-color no-underline border border-[#e0e0e0] [&_a]:text-text-dark-color [&_a]:no-underline select-none"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`,
            }}
          >
            <ul>
              {options.map((option, idx) => {
                if (option?.authorized === false) return null;

                return (
                  <li
                    {...itemProps(option)}
                    key={idx}
                    className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light last:border-b-0 data-[remove=true]:text-text-color-red hover:[&_a]:text-accent-color-light [&_span]:flex [&_span]:items-center [&_span]:gap-2 "
                  >
                    {option?.link ? (
                      <Link href={option?.link}>{content(option)}</Link>
                    ) : (
                      content(option)
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="modal-layout-opacity" onClick={handleIsOpen}></div>
        </Portal>
      )}
      {confirmOpen && (
        <Portal>
          <ConfirmationDelete
            isOpen={confirmOpen}
            setIsOpen={setConfirmOpen}
            onConfirm={handleConfirm}
            deletionName={deleteOption?.deletionName}
            project={isProject}
          />
        </Portal>
      )}
    </>
  );
}
