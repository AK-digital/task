"use client";
// import styles from "@/styles/components/projects/projectMembers.module.css";
import { displayPicture } from "@/utils/utils";
import { useRef, useState } from "react";
import UsersInfo from "../Popups/UsersInfo";
import Portal from "../Portal/Portal";

export default function ProjectMembers({ members }) {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState(null);

  const moreRef = useRef(null);
  const hoverTimeout = useRef(null);
  const defaultUsers = members.map((member) => member.user);
  const [users, setUsers] = useState(defaultUsers);

  const clearHoverTimeout = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
  };

  const handleMoreMouseEnter = () => {
    clearHoverTimeout();
    if (moreRef.current) {
      const rect = moreRef.current.getBoundingClientRect();
      setStyle({
        top: rect.top + rect.height + window.scrollY - 16,
        left: rect.left + window.scrollX,
      });
      setUsers(defaultUsers);

      setIsOpen(true);
    }
  };

  const handleSingleMouseEnter = (e) => {
    clearHoverTimeout();
    const userId = e.currentTarget.dataset.userId;
    const user = defaultUsers.find((u) => u._id === userId);

    if (user) {
      const rect = e.currentTarget.getBoundingClientRect();
      setStyle({
        top: rect.top + window.scrollY + rect.height - 12,
        left: rect.left + window.scrollX,
      });
      setUsers([user]);

      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    clearHoverTimeout();
    hoverTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handlePopupMouseEnter = () => {
    clearHoverTimeout();
  };

  const handlePopupMouseLeave = () => {
    clearHoverTimeout();
    hoverTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  return (
    <>
      <div className="flex">
        {/* Membres du projet (affiche max 4) */}
        {defaultUsers.slice(0, 4).map((user) => (
          <div
            key={user?._id}
            className="-ml-2"
            onMouseEnter={handleSingleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-user-id={user?._id}
          >
            {displayPicture(user, 30, 30)}
          </div>
        ))}

        {/* Affichage "+n" si plus de 4 membres */}
        {defaultUsers?.length > 4 && (
          <div
            className="-ml-2"
            ref={moreRef}
            onMouseEnter={handleMoreMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center justify-center w-[30px] h-[30px] bg-[#ccc] text-black rounded-full text-xs font-bold cursor-default border-2 border-white">
              +{defaultUsers.length - 4}
            </div>
          </div>
        )}
      </div>

      {/* PORTAL pour la popup */}
      {isOpen && style && (
        <Portal>
          <div
            onMouseEnter={handlePopupMouseEnter}
            onMouseLeave={handlePopupMouseLeave}
          >
            <UsersInfo users={users} style={style} />
          </div>
        </Portal>
      )}
    </>
  );
}
