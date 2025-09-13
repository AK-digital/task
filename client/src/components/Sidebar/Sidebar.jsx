"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function Sidebar({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = "500px" 
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [isOpening, setIsOpening] = useState(true);

  // Animation d'ouverture
  useEffect(() => {
    if (isOpen) {
      setIsOpening(true);
      const timer = setTimeout(() => {
        setIsOpening(false);
      }, 50); // Petit délai pour déclencher l'animation
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setIsOpening(true);
    }, 300); // Durée de l'animation de fermeture
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full bg-secondary shadow-[0px_0px_20px_#00000030] z-[9999] transform transition-transform duration-300 ease-in-out ${
          isClosing ? 'translate-x-full' : isOpening ? 'translate-x-full' : 'translate-x-0'
        }`}
        style={{ width }}
      >
        {/* Header avec bouton de fermeture */}
        <div className="flex items-center justify-between p-6 border-b border-color-border-color">
          <h2 className="font-medium text-large text-black">{title}</h2>
        <span
                      onClick={handleClose}
                      className="text-text-color-muted hover:text-accent-color transition-colors duration-200"
                      title="Fermer"
                  >
            <X size={24} />
          </span>
        </div>
        
        {/* Contenu scrollable */}
        <div className="flex flex-col gap-5 p-6 h-full overflow-y-auto pb-40">
          {children}
        </div>
      </div>
      
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[9998] transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : isOpening ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />
    </>
  );
}
