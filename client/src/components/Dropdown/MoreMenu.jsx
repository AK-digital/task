"use client";
import Link from "next/link";
import React from "react";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
import Portal from "../Portal/Portal";

export function MoreMenu({ isOpen, setIsOpen, options, triggerRef }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [deleteOption, setDeleteOption] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [hoveredSubmenu, setHoveredSubmenu] = useState(null);
  const [submenuPosition, setSubmenuPosition] = useState({ top: 0, left: 0 });

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
    if (option.submenu) {
      // Ne rien faire, le submenu est géré par hover
      return;
    }
    
    if (option.remove) {
      setDeleteOption(option);
      setPendingAction(() => option.function);
      setConfirmOpen(true);
    } else {
      option.function?.();
      setIsOpen(false);
    }
  };

  const handleSubmenuItemClick = (submenuItem) => {
    submenuItem.function?.();
    setIsOpen(false);
    setHoveredSubmenu(null);
  };

  const handleMouseEnter = (option, index, event) => {
    if (option.submenu) {
      setHoveredSubmenu(index);
      const rect = event.currentTarget.getBoundingClientRect();
      setSubmenuPosition({
        top: rect.top + window.scrollY,
        left: rect.right + window.scrollX + 5,
      });
    }
  };

  const handleMouseLeave = (e) => {
    // Vérifier si on quitte vers le submenu
    const rect = e.currentTarget.getBoundingClientRect();
    const isMovingToSubmenu = e.clientX > rect.right;
    
    if (!isMovingToSubmenu) {
      // Délai pour permettre de passer au submenu
      setTimeout(() => {
        setHoveredSubmenu(null);
      }, 200);
    }
  };

  const handleSubmenuMouseEnter = () => {
    // Garder le submenu ouvert quand on le survole
  };

  const handleSubmenuMouseLeave = () => {
    setHoveredSubmenu(null);
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

  function itemProps(option, index) {
    const props = {
      onClick: () => handleClick(option),
      onMouseEnter: (e) => handleMouseEnter(option, index, e),
      onMouseLeave: handleMouseLeave,
      "data-remove": option?.remove,
      "data-submenu": option?.submenu ? true : false,
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
                    {...itemProps(option, idx)}
                    key={idx}
                    className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light last:border-b-0 data-[remove=true]:text-text-color-red hover:[&_a]:text-accent-color-light [&_span]:flex [&_span]:items-center [&_span]:gap-2 data-[submenu=true]:relative"
                  >
                    {option?.link ? (
                      <Link href={option?.link}>{content(option)}</Link>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        {content(option)}
                        {option?.submenu && <ChevronRight size={14} />}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="modal-layout-opacity" onClick={handleIsOpen}></div>
        </Portal>
      )}
      
      {/* Submenu */}
      {hoveredSubmenu !== null && options[hoveredSubmenu]?.submenu && (
        <Portal>
          <div
            className="fixed z-20002 bg-secondary rounded-lg w-max text-small py-2 px-4 shadow-xl text-text-dark-color no-underline border border-[#e0e0e0] select-none"
            style={{
              top: `${submenuPosition.top}px`,
              left: `${submenuPosition.left}px`,
            }}
            onMouseEnter={handleSubmenuMouseEnter}
            onMouseLeave={handleSubmenuMouseLeave}
          >
            <ul>
              {options[hoveredSubmenu].submenu.map((submenuItem, idx) => {
                if (submenuItem?.authorized === false) return null;

                return (
                  <li
                    key={idx}
                    onClick={() => handleSubmenuItemClick(submenuItem)}
                    className="option cursor-pointer py-2 border-b border-primary hover:text-accent-color-light last:border-b-0 data-[remove=true]:text-text-color-red"
                  >
                    <span className="flex items-center gap-2">
                      {submenuItem?.icon}
                      {submenuItem?.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
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
