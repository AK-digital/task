"use client";
import styles from "@/styles/layouts/side-nav.module.css";
import { useParams } from "next/navigation";
import { useState } from "react";
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
import { useTranslation } from "react-i18next";

export default function SideNav() {
  const { t } = useTranslation();
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
            src={"/clynt-logo-dark.svg"}
            width={32}
            height={32}
            alt={t("navigation.logo_alt")}
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
            <Link href={"/tasks"} title={t("navigation.my_tasks")}>
              <div>
                <ClipboardList size={24} />
              </div>
              <span>{t("navigation.my_tasks")}</span>
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
            <span>{t("navigation.my_projects")}</span>
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
            <span>{t("navigation.time_tracking")}</span>
          </Link>
          <Link href={"/new-project"}>
            <div>
              <Plus size={24} />
            </div>
            <span>{t("navigation.add_project")}</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
