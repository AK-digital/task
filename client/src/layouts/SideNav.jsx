"use client";
import styles from "@/styles/layouts/side-nav.module.css";
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
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LayoutGrid,
  Plus,
  ClipboardList,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import { useFavorites } from "@/app/hooks/useFavorites";
import ProjectSideNav from "@/components/Projects/ProjectSideNav";
import ProjectSideNavSkeleton from "@/components/Projects/ProjectSideNavSkeleton";

export default function SideNav() {
  const params = useParams();
  const { slug } = params;
  const id = slug ? slug[0] : null;
  const projectId = id ?? "";
  const { favorites, favoritesLoading } = useFavorites();
  const projects = favorites?.map((favorite) => favorite.project);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const firstDayOfTheMonth = moment().startOf("month").format("YYYY-MM-DD");
  const lastDayOfTheMonth = moment().endOf("month").format("YYYY-MM-DD");

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
            <Link href={"/tasks"} title="Mes tâches">
              <div>
                <ClipboardList size={24} />
              </div>
              <span>Mes tâches</span>
            </Link>
          </div>
          <nav className={styles.nav}>
            {favoritesLoading ? (
              <ProjectSideNavSkeleton />
            ) : (
              projects?.map((project) => (
                <ProjectSideNav
                  key={project._id}
                  project={project}
                  isActive={project._id === projectId}
                  open={isMenuOpen}
                />
              ))
            )}
          </nav>
        </div>
        <div className={styles.actions}>
          <Link href={"/projects"} data-active={projectId === ""}>
            <div>
              <LayoutGrid size={24} />
            </div>
            <span>Mes projets</span>
          </Link>
          <Link
            href={
              "/times?startingDate=" +
              firstDayOfTheMonth +
              "&endingDate=" +
              lastDayOfTheMonth
            }
          >
            <div>
              <Clock3 size={24} />
            </div>
            <span>Suivi du temps</span>
          </Link>
          <Link href={"/new-project"}>
            <div>
              <Plus size={24} />
            </div>
            <span>Ajouter un projet</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
