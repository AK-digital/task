"use client";
import styles from "@/styles/layouts/side-nav.module.css";
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
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SideNav({ projects }) {
  const params = useParams();
  const { slug } = params;
  const id = slug ? slug[0] : null;
  const projectId = id ?? "";
  const [projectItems, setProjectItems] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (projects) {
      setProjectItems(projects);
    }
  }, [projects]);

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

      const newItems = arrayMove(projectItems, oldIndex, newIndex);
      setProjectItems(newItems);

      try {
        const response = await updateProjectsOrder(newItems);

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

  return (
    <aside className={styles.container} data-open={isMenuOpen}>
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
          <div className={styles.myTasks}>
            <Link
              href={"/myTasks"}
              className={styles.myTasksLink}
              title="Mes tâches"
            >
              <ClipboardList size={24} />
            </Link>
          </div>
          <nav className={styles.nav}>
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
          <Link href={"/new-project"} className={styles.createProjectButton}>
            <Plus size={24} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
