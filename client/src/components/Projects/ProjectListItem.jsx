import ProjectMembers from "./ProjectMembers";
import StatusSegment from "./StatusSegment";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import Image from "next/image";
import { deleteFavorite, saveFavorite } from "@/api/favorite";
import { useContext, useState } from "react";
import { AuthContext } from "@/context/auth";
import { mutate } from "swr";

export default function ProjectListItem({
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
    e.preventDefault();

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

  if (isDefaultProject) {
    return (
      <Link
        href={href}
        className="no-underline w-full hover:bg-secondary/50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-6 p-4 bg-secondary rounded-lg border-2 border-dashed border-[#d0cec7]">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-[18px] h-[18px]"></div>
            
            <div className="flex items-center justify-center w-[40px] h-[40px] bg-[#d0cec7] rounded-full">
              <Plus size={20} className="text-gray-600" />
            </div>
            
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-text-darker-color">
                Créer un nouveau projet
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-text-darker-color">
            <div className="text-center min-w-[80px] opacity-50">
              <span className="font-medium">-</span>
              <div className="text-xs text-text-color-muted">tableaux</div>
            </div>
            
            <div className="text-center min-w-[80px] opacity-50">
              <span className="font-medium">-</span>
              <div className="text-xs text-text-color-muted">tâches</div>
            </div>
            
            <div className="flex items-center gap-3 min-w-[200px] opacity-50">
              <span className="text-xs text-text-color-muted whitespace-nowrap">Progression:</span>
              <div className="flex h-2 w-full rounded-full bg-[#d0cec7]"></div>
            </div>
            
            <div className="min-w-[120px] opacity-50">
              <div className="flex">
                <div className="w-[30px] h-[30px] bg-[#d0cec7] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="no-underline w-full hover:bg-secondary/50 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-6 p-4 bg-secondary rounded-lg">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Star
            size={18}
            onClick={handleFavorite}
            className={`cursor-pointer ${
              isFavorite
                ? "fill-accent-color text-accent-color"
                : "fill-[#d0cec7] text-[#d0cec7]"
            }`}
          />
          
          <Image
            src={project?.logo || "/default/default-project-logo.webp"}
            alt="project"
            width={40}
            height={40}
            className="rounded-full w-[40px] h-[40px] max-w-[40px] max-h-[40px] flex-shrink-0"
          />
          
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-medium text-text-darker-color truncate">
              {name}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-text-darker-color">
          <div className="text-center min-w-[80px]">
            <span className="font-medium">{totalBoards}</span>
            <div className="text-xs text-text-color-muted">
              tableau{totalBoards === 1 ? "" : "x"}
            </div>
          </div>
          
          <div className="text-center min-w-[80px]">
            <span className="font-medium">{totalTasks}</span>
            <div className="text-xs text-text-color-muted">
              tâche{totalTasks === 1 ? "" : "s"}
            </div>
          </div>
          
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-xs text-text-color-muted whitespace-nowrap">Progression:</span>
            <div className="flex h-2 w-full rounded-full bg-[#e9ecef] overflow-hidden">
              {statuses.map((status) => (
                <StatusSegment
                  key={status?._id}
                  status={status}
                  totalTasks={totalTasks}
                />
              ))}
            </div>
          </div>
          
          <div className="min-w-[120px]">
            <ProjectMembers members={members} />
          </div>
        </div>
      </div>
    </Link>
  );
} 