"use client";
import { useParams, usePathname } from "next/navigation";
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
import { useFavorites } from "../../hooks/useFavorites";
import ProjectSideNav from "@/components/Projects/ProjectSideNav";
import ProjectSideNavSkeleton from "@/components/Projects/ProjectSideNavSkeleton";
import { useSideNavContext } from "@/context/SideNavContext";

export default function SideNav() {
  const pathname = usePathname();
  const params = useParams();
  const { slug } = params;
  const id = slug ? slug[0] : null;
  const projectId = id ?? "";
  const { favorites, favoritesLoading } = useFavorites();
  const projects = favorites?.map((favorite) => favorite.project);
  const { isMenuOpen, setIsMenuOpen } = useSideNavContext();

  const isProjectsPage = pathname === "/projects";
  const isTasksPage = pathname === "/tasks";
  const isTimesPage = pathname === "/times";

  return (
    <aside
      data-open={isMenuOpen}
      className="container_SideNav min-w-aside-width w-aside-width transition-[width,min-width] duration-[150ms] ease-linear select-none data-[open=true]:w-[220px] data-[open=true]:min-w-[220px]"
    >
      <div className="wrapper_SideNav fixed top-0 min-w-aside-width flex flex-col justify-between gap-2 w-aside-width pt-[22px] pr-0 pb-8 pl-[11px] h-full transition-[width,min-width] duration-[150ms] ease-linear bg-[#2a3730] [&_a]:no-underline">
        <div>
          <Link href={"/projects"}>
            <Image
              src={"/clynt/clynt-logo-dark.svg"}
              width={32}
              height={32}
              alt="Logo de Clynt"
              className="block ml-[5px] mr-auto"
            />
          </Link>
          <div
            onClick={(e) => setIsMenuOpen(!isMenuOpen)}
            className="flex justify-center items-center w-[42px] h-[42px] min-h-[42px] cursor-pointer rounded-full text-text-color my-5 hover:text-accent-color-hover"
          >
            {isMenuOpen && <ArrowLeftFromLine size={24} />}
            {!isMenuOpen && <ArrowRightFromLine size={24} />}
          </div>
          <div className="flex justify-start items-center -mt-3 mb-[18px]">
            <Link
              href={"/tasks"}
              title="Mes tâches"
              data-active={isTasksPage}
              className="group containerIcon_SideNav relative flex justify-start gap-3 w-full items-center transition-all ease-linear duration-150 cursor-pointer hover:text-accent-color-hover"
            >
              <div className="flex justify-center items-center w-[42px] min-w-[42px] h-[42px] min-h-[42px] rounded-full text-side bg-primary">
                <ClipboardList
                  size={24}
                  className="bg-transparent text-side transition-all ease-linear duration-150 group-hover:animate-bounce-light"
                />
              </div>
              {isMenuOpen && (
                <span className="text-small whitespace-nowrap overflow-hidden overflow-ellipsis mr-5 font-normal text-text-lighter-color">
                  Mes tâches
                </span>
              )}
            </Link>
          </div>
          <nav className="relative flex flex-col gap-2 flex-1 max-h-[50svh] overflow-y-auto scroll-smooth no-scrollbar">
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
        <div className="flex justify-center items-start flex-col gap-3 min-w-10 rounded-full">
          <Link
            className="group containerIcon_SideNav relative flex justify-start gap-3 w-full items-center transition-all ease-linear duration-150 cursor-pointer hover:text-accent-color-hover"
            href={"/projects"}
            data-active={isProjectsPage}
            title="Mes projets"
          >
            <div className="flex justify-center items-center w-[42px] min-w-[42px] h-[42px] min-h-[42px] rounded-full text-side bg-primary">
              <LayoutGrid
                size={24}
                className="bg-primary text-side transition-all ease-linear duration-150 group-hover:animate-bounce-light"
              />
            </div>
            {isMenuOpen && (
              <span className="text-small whitespace-nowrap overflow-hidden overflow-ellipsis mr-5 font-normal text-text-lighter-color">
                Mes projets
              </span>
            )}
          </Link>
          <Link
            href={"/times"}
            title="Suivi du temps"
            className="group containerIcon_SideNav relative flex justify-start gap-3 w-full items-center transition-all ease-linear duration-150 cursor-pointer hover:text-accent-color-hover"
            data-active={isTimesPage}
          >
            <div className="flex justify-center items-center w-[42px] min-w-[42px] h-[42px] min-h-[42px] rounded-full text-side bg-primary">
              <Clock3
                size={24}
                className="bg-primary text-side transition-all ease-linear duration-150 group-hover:animate-bounce-light"
              />
            </div>
            {isMenuOpen && (
              <span className="text-small whitespace-nowrap overflow-hidden overflow-ellipsis mr-5 font-normal text-text-lighter-color">
                Suivi du temps
              </span>
            )}
          </Link>
          <Link
            href={"/new-project"}
            title="Ajouter un projet"
            className="group containerIcon_SideNav relative flex justify-start gap-3 w-full items-center transition-all ease-linear duration-150 cursor-pointer hover:text-accent-color-hover"
          >
            <div className="flex justify-center items-center w-[42px] min-w-[42px] h-[42px] min-h-[42px] rounded-full text-side bg-primary">
              <Plus
                size={24}
                className="bg-primary text-side transition-all ease-linear duration-150 group-hover:animate-bounce-light"
              />
            </div>
            {isMenuOpen && (
              <span className="text-small whitespace-nowrap overflow-hidden overflow-ellipsis mr-5 font-normal text-text-lighter-color">
                Ajouter un projet
              </span>
            )}
          </Link>
        </div>
      </div>
    </aside>
  );
}
