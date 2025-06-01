"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftFromLine,
  ArrowRightFromLine,
  LayoutGrid,
  Plus,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
