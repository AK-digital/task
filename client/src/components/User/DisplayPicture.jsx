import Image from "next/image";
import NoPicture from "./NoPicture";
import { useState, useRef } from "react";
import UsersInfo from "../Popups/UsersInfo";
import Portal from "../Portal/Portal";

export default function DisplayPicture({ user, style, isPopup = true }) {
  const hasPicture = user?.picture;
  const [isOpen, setIsOpen] = useState(false);
  const [stylePopup, setStylePopup] = useState({
    top: "40px",
    left: "30px",
  });
  const imageRef = useRef(null);

  const handleMouseEnter = () => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setStylePopup({
        top: `${rect.bottom + window.scrollY + 5}px`,
        left: `${rect.left + window.scrollX}px`,
      });
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <>
      {hasPicture ? (
        <Image
          ref={imageRef}
          src={user?.picture}
          width={style?.width?.replace("px", "")}
          height={style?.height?.replace("px", "")}
          quality={100}
          alt={`Photo de ${user?.firstName}`}
          style={{
            ...style,
            minHeight: style?.height,
            minWidth: style?.width
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="rounded-full select-none"
        />
      ) : (
        <div
          ref={imageRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ border: "none" }}
          className="select-none"
        >
          <NoPicture width={style?.width} height={style?.height} user={user} />
        </div>
      )}
      {isOpen && isPopup && (
        <Portal>
          <div>
            <UsersInfo users={[user]} style={stylePopup} />
          </div>
        </Portal>
      )}
    </>
  );
}
