"use client";
import styles from "@/styles/layouts/side-nav.module.css";
import CreateProject from "@/components/Projects/CreateProject";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableProject from "@/components/Projects/SortableProject";
import { updateProjectsOrder } from "@/actions/project";
import { MeasuringStrategy } from "@dnd-kit/core";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LayoutGrid,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SideNav({ projects }) {
  const params = useParams();
  const { slug } = params;
  const id = slug ? slug[0] : null;
  const projectId = id ?? "";
  const [isCreating, setIsCreating] = useState(false);
  const [projectItems, setProjectItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const containerRef = useRef(null);
  const [navHeight, setNavHeight] = useState("50vh"); // Hauteur par défaut
  const [projectItemHeight, setProjectItemHeight] = useState(0);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  useEffect(() => {
    if (projects) {
      setProjectItems(projects);
    }
  }, [projects]);

  // Calculer la hauteur optimale de la navigation
  useEffect(() => {
    const calculateOptimalHeight = () => {
      if (!navRef.current || !containerRef.current) return;

      // Hauteur du conteneur parent
      const containerHeight = containerRef.current.clientHeight;

      // Espace utilisé pour le logo, les boutons de contrôle, etc.
      const topOffset = navRef.current.offsetTop;
      const bottomOffset = 125; // Actions en bas + espace

      // Hauteur disponible
      const availableHeight = containerHeight - topOffset - bottomOffset;

      // Obtenir la hauteur d'un élément de projet
      const projectElement = navRef.current.querySelector(`.${styles.project}`);
      if (projectElement) {
        const itemHeight = projectElement.offsetHeight + 8; // +8 pour le gap
        setProjectItemHeight(itemHeight);

        // Calculer combien d'éléments complets peuvent s'afficher
        const visibleItems = Math.floor(availableHeight / itemHeight);

        // Définir la hauteur pour afficher exactement ce nombre d'éléments

        // S'assurer que la hauteur est exactement un multiple de la hauteur d'élément
        const optimalHeight = visibleItems * itemHeight;
        setNavHeight(`${optimalHeight}px`);
      }
    };

    calculateOptimalHeight();
    window.addEventListener('resize', calculateOptimalHeight);

    return () => {
      window.removeEventListener('resize', calculateOptimalHeight);
    };
  }, [projectItems, isMenuOpen]);

  useEffect(() => {
    if (navRef.current) {
      checkScrollability();

      // Observer les changements de dimension
      const resizeObserver = new ResizeObserver(checkScrollability);
      resizeObserver.observe(navRef.current);

      return () => resizeObserver.disconnect();
    }
  }, [projectItems, isMenuOpen, navHeight]);

  // Fonction pour gérer le défilement de la molette de souris
  const handleWheel = useCallback((e) => {
    e.preventDefault();

    if (!navRef.current) return;

    // Détermine la direction du défilement
    if (e.deltaY > 0 && canScrollDown) {
      scrollDown();
    } else if (e.deltaY < 0 && canScrollUp) {
      scrollUp();
    }
  }, [canScrollDown, canScrollUp]);

  // Attacher l'événement de la molette
  useEffect(() => {
    const navElement = navRef.current;
    if (navElement) {
      navElement.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        navElement.removeEventListener('wheel', handleWheel);
      };
    }
  }, [handleWheel]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event) {
    const { active, over } = event;

    if (active?.id !== over?.id) {
      const oldIndex = projectItems.findIndex(
        (project) => project?._id === active.id
      );
      const newIndex = projectItems.findIndex(
        (project) => project?._id === over.id
      );
      console.log("handleDragEnd", event);

      const newItems = arrayMove(projectItems, oldIndex, newIndex);
      setProjectItems(newItems);

      try {
        const response = await updateProjectsOrder(newItems);

        console.log("response", response);

        if (!response.success) {
          setProjectItems(projectItems);
          console.error(
            "Erreur lors de la mise à jour de l'ordre:",
            response.message
          );
        }
      } catch (error) {
        setProjectItems(projectItems);
        console.error("Erreur lors de la mise à jour de l'ordre:", error);
      }
    }
  }

  const checkScrollability = () => {
    if (!navRef.current || !projectItemHeight) return;

    const { scrollHeight, clientHeight, scrollTop } = navRef.current;
    const maxVisibleItems = Math.floor(clientHeight / projectItemHeight);
    const totalItems = projectItems.length;

    // Calculer l'index actuel approximatif du premier élément visible
    const currentFirstVisibleIndex = Math.floor(scrollTop / projectItemHeight);

    setCanScrollUp(currentFirstVisibleIndex > 0);

    // On ne peut pas défiler davantage si on affiche déjà les derniers éléments
    const maxFirstVisibleIndex = Math.max(0, totalItems - maxVisibleItems);
    setCanScrollDown(currentFirstVisibleIndex < maxFirstVisibleIndex);
  };

  // Fonction améliorée pour défiler d'un élément à la fois
  const scrollToPrevProject = () => {
    if (!navRef.current || !canScrollUp || !projectItemHeight) return;

    const currentScrollTop = navRef.current.scrollTop;
    const targetScrollTop = Math.max(0, currentScrollTop - projectItemHeight);

    navRef.current.scrollTo({
      top: targetScrollTop,
      behavior: "smooth"
    });

    setTimeout(checkScrollability, 400);
  };

  const scrollToNextProject = () => {
    if (!navRef.current || !canScrollDown || !projectItemHeight) return;

    const currentScrollTop = navRef.current.scrollTop;
    const maxVisibleItems = Math.floor(navRef.current.clientHeight / projectItemHeight);
    const totalItems = projectItems.length;

    // Calculer l'index actuel approximatif du premier élément visible
    const currentFirstVisibleIndex = Math.floor(currentScrollTop / projectItemHeight);

    // Calculer l'index maximal possible pour le premier élément visible
    const maxFirstVisibleIndex = Math.max(0, totalItems - maxVisibleItems);

    // Limiter le défilement pour ne pas dépasser le nombre total d'éléments
    const nextIndex = Math.min(currentFirstVisibleIndex + 1, maxFirstVisibleIndex);

    // Déterminer la position précise pour le défilement
    const targetScrollTop = nextIndex * projectItemHeight;

    navRef.current.scrollTo({
      top: targetScrollTop,
      behavior: "smooth"
    });

    setTimeout(checkScrollability, 400);
  };

  // Remplacement des anciennes fonctions par les nouvelles
  const scrollUp = scrollToPrevProject;
  const scrollDown = scrollToNextProject;

  return (
    <aside className={styles.container} data-open={isMenuOpen} ref={containerRef}>
      <div className={styles.wrapper}>
        <div className={styles.top}>
          <Image
            src={"/task.svg"}
            width={46}
            height={18}
            alt="Logo de Täsk"
            className={styles.logo}
          />
          <div
            className={styles.openArrow}
            onClick={(e) => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen && <ArrowLeftFromLine size={24} />}
            {!isMenuOpen && <ArrowRightFromLine size={24} />}
          </div>
          <nav
            className={styles.nav}
            ref={navRef}
            onScroll={checkScrollability}
            style={{ maxHeight: navHeight }} // Appliquer la hauteur dynamique
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              measuring={{
                droppable: {
                  strategy: MeasuringStrategy.Always,
                },
              }}
              modifiers={[]}
            >
              <SortableContext
                items={projectItems.map((project) => project._id)}
                strategy={verticalListSortingStrategy}
              >
                {projectItems?.map((project) => (
                  <SortableProject
                    key={project._id}
                    project={project}
                    projectId={projectId}
                    isActive={project._id === projectId}
                    open={isMenuOpen}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </nav>
        </div>
        <div className={styles.actions}>
          <Link
            className={styles.openProjects}
            href={"/projects"}
            data-active={projectId === ""}
          >
            <LayoutGrid size={24} />
          </Link>
          <div className={styles.createProjectButton}>
            <Link href={"/new-project"}>
              <Plus size={32} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
