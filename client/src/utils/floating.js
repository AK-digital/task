"use client";
import { flip, offset, useFloating, shift } from "@floating-ui/react";
import { useEffect } from "react";

export function getFloating(isOpen, setIsOpen) {
  const { refs, floatingStyles } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    strategy: "absolute",
    placement: "bottom-center",
    middleware: [offset(10), flip(), shift({ padding: 8 })],
  });

  return { refs, floatingStyles };
}

export const usePreventScroll = ({
  elementRef = null,
  shouldPrevent = false,
  mode = "element",
}) => {
  useEffect(() => {
    const handler = (e) => {
      if (!shouldPrevent) return;

      if (mode === "body") {
        // Permettre le défilement dans les éléments avec la classe .scrollable ou styles.scrollable
        const scrollableParent = e.target.closest("[class*='scrollable']");
        if (scrollableParent) {
          const canScroll =
            scrollableParent.scrollHeight > scrollableParent.clientHeight;
          if (canScroll) return;
        }
        e.preventDefault();
      } else if (elementRef?.current) {
        // Vérifier si l'événement provient de l'élément ou de ses enfants
        const el = elementRef.current;
        if (!el.contains(e.target)) return;

        // Permettre le défilement si l'élément est scrollable
        const canScroll = el.scrollHeight > el.clientHeight;
        if (!canScroll) {
          e.preventDefault();
        }
      }
    };

    if (shouldPrevent) {
      if (mode === "body") {
        document.body.style.overflow = "hidden";
      }

      // Ajouter les écouteurs d'événements au niveau du document
      document.addEventListener("wheel", handler, { passive: false });
      document.addEventListener("touchmove", handler, { passive: false });
    }

    return () => {
      if (mode === "body") {
        document.body.style.overflow = "";
      }
      document.removeEventListener("wheel", handler);
      document.removeEventListener("touchmove", handler);
    };
  }, [elementRef, shouldPrevent, mode]);
};
