"use client";
import styles from "@/styles/components/dropdown/more.module.css";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import ConfirmationDelete from "../Popups/ConfirmationDelete";
import Portal from "../Portal/Portal";
import { useTranslation } from "react-i18next";

export function MoreMenu({ isOpen, setIsOpen, options }) {
  const { t } = useTranslation();
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
      className: styles.option,
      onClick: () => handleClick(option),
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

      {/* Popup de confirmation */}
      {confirmOpen && (
        <Portal>
          <ConfirmationDelete
            title={`${
              isProject
                ? t("general.project_lowercase")
                : t("general.board_lowercase")
            } ${deleteOption?.deletionName}`}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={handleConfirm}
          />
        </Portal>
      )}
    </>
  );
}
