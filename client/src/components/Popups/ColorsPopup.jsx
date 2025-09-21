import { createPortal } from "react-dom";
import { useEffect, useState, useRef } from "react";

export default function ColorsPopup({
  colors,
  setColor,
  setMoreColor,
  updateStatus,
  triggerRef, // Référence au bouton qui a déclenché le popup
}) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (triggerRef?.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popupWidth = 180;
      const popupHeight = 100; // Hauteur approximative du popup
      
      // Calculer la position optimale
      let top = rect.bottom + 8; // 8px de marge
      let left = rect.left;
      
      // Vérifier si le popup dépasse à droite
      if (left + popupWidth > window.innerWidth) {
        left = window.innerWidth - popupWidth - 8;
      }
      
      // Vérifier si le popup dépasse en bas
      if (top + popupHeight > window.innerHeight) {
        top = rect.top - popupHeight - 8; // Ouvrir vers le haut
      }
      
      // S'assurer que le popup ne dépasse pas à gauche
      if (left < 8) {
        left = 8;
      }
      
      setPosition({ top, left });
    }
  }, [triggerRef]);

  const popupContent = (
    <>
      {/* Overlay plein écran */}
      <div
        className="fixed inset-0 bg-black/30"
        style={{ zIndex: 60000 }}
        onClick={() => setMoreColor(false)}
      />
      
      {/* Popup de couleurs */}
      <div 
        className="bg-secondary p-2 rounded-lg shadow-medium border border-gray-200 w-[180px]"
        style={{
          position: 'fixed',
          top: position.top,
          left: position.left,
          zIndex: 60001
        }}
      >
        <ul className="grid grid-cols-6 justify-center gap-1.5 flex-wrap">
          {colors?.map((color, idx) => {
            return (
              <li
                key={idx}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setColor(color);
                  updateStatus(color);
                }}
                className="h-[22px] w-[22px] rounded-3xl cursor-pointer hover:scale-110 transition-transform"
              ></li>
            );
          })}
        </ul>
      </div>
    </>
  );

  // S'assurer que le portal fonctionne correctement
  if (typeof document === 'undefined') return null;
  
  return createPortal(popupContent, document.body);
}
