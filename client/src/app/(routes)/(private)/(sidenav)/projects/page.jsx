"use client";

// import styles from "@/styles/pages/projects.module.css";
import { getProjects } from "@/api/project";
import Image from "next/image";
import { isNotEmpty } from "@/utils/utils";
import { ListTodo, Users, Plus, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useRouter } from "next/navigation";

export default function Projects() {
  const router = useRouter();
  const { data: projects } = useSWR("/api/project", getProjects);

  return (
    <main className="relative ml-6 w-full max-h-[calc(100vh-62px)]">
      <div className="relative flex items-center flex-col rounded-tl-2xl bg-background-primary-transparent h-full pl-6 pt-6 overflow-hidden">
        <div onClick={() => router.back()} className="absolute z-2 top-20 left-10 cursor-pointer">
          <ArrowLeftCircle size={32} />
        </div>
        <div className="flex justify-between items-center w-full pr-6 mb-5">
          <h1 id="yo">Vos projets</h1>
          <div
            className="text-text-color-muted text-[0.85rem] font-medium bg-background-secondary-color py-1.5 px-3 rounded-lg">
            <span>{projects?.length} projets</span>
          </div>
        </div>

        {isNotEmpty(projects) ? (
          <div className="relative grid [grid-template-columns:repeat(4,minmax(200px,auto))] justify-center w-full gap-y-20 gap-x-15 pt-15 pb-15 pr-6 overflow-y-auto">
            {/* Projets existants */}
            {projects?.map((project) => (
              <div key={project?._id}>
                <Link href={`/projects/${project?._id}`} className="no-underline hover:text-color-accent-color-hover">
                  <div className="relative min-w-55 w-full mx-auto bg-background-secondary-color p-6 rounded-2xl rounded-tl-none overflow-visible transition-all duration-200 ease-in-out cursor-pointer mt-6 no-underline before:content-[''] before:absolute before:-top-6 before:left-0 before:w-35 before:h-6 before:bg-background-secondary-color before:rounded-t-[25px] before:[clip-path:path('M_0_0_L_100_0_C_125_2,_115_24,_140_24_L_0_27_z')] before:z-1 hover:-translate-y-0.5 hover:shadow-shadow-box-medium">
                    <Image
                      src={project?.logo || "/default-project-logo.webp"}
                      alt="project"
                      width={45}
                      height={45}
                      className="rounded-full aspect-[2/2]" />
                    <div className="mt-1">
                      <div className="mb-1 max-w-25 text-nowrap overflow-hidden text-ellipsis">
                        <span>{project?.name}</span>
                      </div>
                      <div className="flex items-center justify-around">
                        <span className="flex items-center justify-center gap-1">
                          <ListTodo size={16} />
                          {project?.tasksCount}
                        </span>
                        <span>
                          <Users size={16} />
                          {project?.members?.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

            {/* Élément pour créer un nouveau projet */}
            <div className="group relative min-w-55 w-full mx-auto bg-[#97897a99] p-6 rounded-2xl rounded-tl-none overflow-visible transition-all duration-200 ease-in-out cursor-pointer mt-6 no-underline before:content-[''] before:absolute before:-top-6 before:left-0 before:w-35 before:h-6 before:bg-[#97897a99] before:duration-250 before:rounded-t-[25px] before:[clip-path:path('M_0_0_L_100_0_C_125_2,_115_24,_140_24_L_0_27_z')] before:z-1 hover:-translate-y-0.5 hover:shadow-shadow-box-medium hover:bg-color-accent-color hover:before:bg-color-accent-color">
              <Link href="/new-project">
                <div className="flex justify-center items-center flex-col h-full text-text-color">
                  <div className="flex justify-center items-center rounded-full w-15 h-15 bg-white/20 mb-[15px] group-hover:bg-white/30">
                    <Plus size={30} />
                  </div>
                  <div className="text-center font-medium">
                    <span>Créer un nouveau projet</span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full h-full text-[1.75rem] text-text-color-muted font-black opacity-50">
            Créez ou sélectionnez un projet.
          </div>
        )}
      </div>
    </main>
  );
}
