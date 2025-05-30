"use client";
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
    <aside data-open={isMenuOpen} className="container_SideNav min-w-spacing-aside-width w-spacing-aside-width transition-[width,min-width] duration-[150ms] ease-linear select-none data-[open=true]:w-[220px] data-[open=true]:min-w-[220px]" >
      <div className="wrapper_SideNav fixed top-0 min-w-spacing-aside-width flex flex-col justify-between gap-7 w-spacing-aside-width pt-[22px] pr-0 pb-8 pl-[11px] h-full transition-[width,min-width] duration-[150ms] ease-linear bg-[#2a3730]">
        <div>
          <Image
            src={"/task.svg"}
            width={46}
            height={18}
            alt="Logo de Täsk"
          />
          <div
            onClick={(e) => setIsMenuOpen(!isMenuOpen)}
            className="flex justify-center items-center w-[42px] h-[42px] min-h-[42px] rounded-full text-text-color my-5 hover:text-color-accent-color-hover hover:cursor-pointer"
          >
            {isMenuOpen && <ArrowLeftFromLine size={24} />}
            {!isMenuOpen && <ArrowRightFromLine size={24} />}
          </div>
          <div className="-mt-3 mb-[18px]">
            <Link
              href={"/tasks"}
              title="Mes tâches"
              className="flex justify-center items-center min-w-10 max-w-10 min-h-10 max-h-10 rounded-full bg-background-primary-color text-background-side-color hover:text-color-accent-color-hover hover:cursor-pointer [&_svg]:transition-all [&_svg]:ease-linear [&_svg]:duration-150"
            >
              <ClipboardList size={24} />
            </Link>
          </div>
          <nav className="nav_SideNav relative flex flex-col gap-2 max-h-[65svh] overflow-y-auto scroll-smooth">
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
        <div className="flex justify-center items-center flex-col gap-3 min-w-10 max-w-10 min-h-10 rounded-full hover:cursor-pointer [&_svg]:transition-all [&_svg]:ease-linear [&_svg]:duration-150">
          <Link
            className="flex justify-center items-center w-[42px] h-[42px] min-h-[42px] rounded-full text-background-side-color bg-background-primary-color hover:text-color-accent-color-hover hover:cursor-pointer"
            href={"/projects"}
            data-active={projectId === ""}
          >
            <LayoutGrid size={24} />
          </Link>
          <Link href={"/new-project"} className="flex justify-center items-center w-[42px] h-[42px] min-h-[42px] rounded-full text-background-side-color bg-background-primary-color hover:text-color-accent-color-hover hover:cursor-pointer">
            <Plus size={24} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
