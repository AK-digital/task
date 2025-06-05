import ProjectMembers from "./ProjectMembers";
import StatusSegment from "./StatusSegment";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";
import { deleteFavorite, saveFavorite } from "@/api/favorite";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth";
import { mutate } from "swr";

export default function ProjectCard({
  project,
  mutateProjects,
  href,
  isDefault,
}) {
  const { uid } = useContext(AuthContext);
  const userFavIds = project?.favorites?.map((fav) => fav.user);
  const hasFav = userFavIds?.includes(uid);
  const [isFavorite, setIsFavorite] = useState(hasFav);
  const isDefaultProject = isDefault || false;

  const statuses = project?.statuses || [];

  const totalTasks = project?.tasksCount || 0;
  const totalBoards = project?.boardsCount || 0;

  const members = project?.members || [];

  const projectId = project?._id;

  const name = project?.name || "Nouveau projet";

  async function handleFavorite(e) {
    e.stopPropagation();

    if (isFavorite) {
      await RemoveFavorite();
    } else {
      await AddFavorite();
    }
  }

  async function AddFavorite() {
    setIsFavorite(true);

    const res = await saveFavorite(projectId);

    if (!res.success) {
      setIsFavorite(false);
      return;
    }

    mutateProjects();
    mutate("/favorite");
  }

  async function RemoveFavorite() {
    setIsFavorite(false);
    const favoriteId = project?.favorites?.find((fav) => fav.user === uid)?._id;

    const res = await deleteFavorite(favoriteId);

    if (!res.success) {
      setIsFavorite(true);
      return;
    }
    mutateProjects();
    mutate("/favorite");
  }

  return (
    <div
      key={projectId}
      data-default={isDefaultProject}
      className="projectWrapper_ProjectCard relative flex flex-col max-w-[290px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl overflow-visible transition-all duration-200 ease-in-out cursor-pointer no-underline hover:-translate-y-0.5"
    >
      <div className="starWrapper_ProjectCard relative top-px left-0 bg-secondary w-40 h-[30px] rounded-tl-2xl rounded-tr-0 rounded-bl-0 rounded-br-0 [clip-path:path('M_0_0_L_128_0_C_144_2_136_24,_160_34_L_0_34_Z')]">
        <Star
          size={18}
          onClick={handleFavorite}
          className={`absolute top-[7px] left-[15px] ${
            isFavorite
              ? "fill-accent-color text-accent-color"
              : "fill-[#d0cec7] text-[#d0cec7]"
          }`}
        />
      </div>

      <Link href={href} className="no-underline flex-1 flex">
        <div className="contentWrapper_ProjectCard flex-1 bg-secondary py-[18px] px-[22px] min-h-[181px] rounded-tr-2xl rounded-bl-2xl rounded-br-2xl rounded-tl-none transition-all duration-200 ease-in-out hover:shadow-[10px_10px_10px_rgba(0,0,0,0.1)] hover:!text-transparent flex flex-col justify-between">
          <div>
            {isDefaultProject ? (
              <div className="flex justify-between w-full rounded-2xl select-none">
                <div className="flex items-center justify-center w-[45px] h-[45px] bg-[#d0cec7] rounded-full">
                  <Image
                    src="/default-project-logo.svg"
                    alt="project"
                    width={22}
                    height={22}
                    className="rounded-full w-[22px] h-[22px] max-w-[22px] max-h-[22px]"
                  />
                </div>

                <div className="flex w-[30px] h-[30px] max-w-[30px] max-h-[30px] rounded-full bg-[#d0cec7]">
                  <div className="-ml-2"></div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between w-full rounded-2xl select-none">
                <Image
                  src={project?.logo || "/default-project-logo.webp"}
                  alt="project"
                  width={45}
                  height={45}
                  className="rounded-full w-[45px] h-[45px] max-w-[45px] max-h-[45px] cursor-pointer"
                />

                <ProjectMembers members={members} />
              </div>
            )}
            <div className="whitespace-nowrap overflow-hidden text-ellipsis text-xl mt-1.5 text-text-darker-color">
              <span>{name}</span>
            </div>
          </div>

          {isDefaultProject ? (
            <div className="flex flex-col gap-2.5 text-small">
              <div className="tabs_ProjectCard text-text-darker-color"></div>
              <div className="flex justify-between items-center text-text-darker-color">
                <div className="rounded-[5px] bg-[#d0cec7] w-[76px] h-3" />
                <div className="statusBar_ProjectCard flex h-3 w-full rounded-[5px] flex-[0.5] bg-[#d0cec7]"></div>
              </div>
            </div>
          ) : (
            project && (
              <div className="flex flex-col gap-2.5 text-small">
                <span className="text-text-darker-color select-none">
                  {`${totalBoards} tableau${totalBoards === 1 ? "" : "x"}`}
                </span>
                <div className="flex justify-between items-center text-text-darker-color select-none">
                  {`${totalTasks} tâche${totalTasks === 1 ? "" : "s"}`}
                  <div className="flex h-3 w-full rounded-[5px] bg-[#e9ecef] flex-[0.5] statusBar_ProjectCard">
                    {statuses.map((status, idx) => {
                      return (
                        <StatusSegment
                          key={status?._id}
                          status={status}
                          totalTasks={totalTasks}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </Link>
    </div>
  );
}
