"use client";
import styles from "@/styles/layouts/side-nav.module.css";
import CreateProject from "@/components/Projects/CreateProject";
import UserInfo from "@/components/Header/UserInfo";
import SignOut from "@/components/auth/SignOut";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
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
import Image from "next/image";

export default function SideNav({ projects }) {
  const params = useParams();
  const { slug } = params;
  const id = slug ? slug[0] : null;
  const projectId = id ?? "";
  const [projectItems, setProjectItems] = useState([]);

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
    <aside className={styles.container}>
      <Image src={"/task-logo.svg"} width={70} height={30} alt="Logo de Task" />
      <div className={styles.wrapper}>
        <div className={styles.projects}>
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
              <ul className={styles.projectsList}>
                <SortableContext
                  items={projectItems.map((project) => project._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {projectItems?.map((project) => (
                    <SortableProject
                      key={project._id}
                      project={project}
                      projectId={projectId}
                      isActive={project._id === projectId} // Ajout de la prop isActive
                    />
                  ))}
                </SortableContext>
              </ul>
            </DndContext>
          </nav>
          <CreateProject />
        </div>
        <div className={styles.footer}>
          <div className={styles.userAvatar}>
            <UserInfo />
          </div>
          <div className={styles.signOut}>
            <SignOut />
          </div>
        </div>
      </div>
    </aside>
  );
}
