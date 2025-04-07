import styles from "@/styles/components/boards/board-more.module.css";
import {
  Archive,
  ArchiveRestore,
  Save,
  Settings2Icon,
  Trash,
} from "lucide-react";
import { deleteBoard } from "@/actions/board";
import { addBoardToArchive, removeBoardFromArchive } from "@/api/board";
import { saveBoardTemplate } from "@/api/template";
import { useUserRole } from "@/app/hooks/useUserRole";

export default function BoardMore({ project, board, setMore, archive }) {
  const isBoardArchived = board?.archived;
  const canPost = useUserRole(project, ["owner", "manager"]);
  const canDelete = useUserRole(project, ["owner", "manager"]);

  const handleAddArchive = async (e) => {
    e.preventDefault();
    await addBoardToArchive(board?._id, project?._id);
  };

  const handleRestoreBoard = async (e) => {
    e.preventDefault();
    await removeBoardFromArchive(board?._id, project?._id);
  };

  const handleAddBoardTemplate = async (e) => {
    await saveBoardTemplate(board?._id, project?._id);
    e.preventDefault();
  };

  async function handleDeleteBoard() {
    const confirmed = confirm("Supprimer ce tableau ?");

    if (!confirmed) return;

    await deleteBoard(board?._id, project?._id);
  }

  return (
    <>
      <div id="popover" className={styles.popup}>
        <ul className={styles.items}>
          {!isBoardArchived ? (
            <li className={styles.item} onClick={handleAddArchive}>
              <Archive size={16} />
              Archiver le tableau
            </li>
          ) : (
            <li className={styles.item} onClick={handleRestoreBoard}>
              <ArchiveRestore size={16} />
              Restaurer le tableau
            </li>
          )}
          {canPost && (
            <li className={styles.item} onClick={handleAddBoardTemplate}>
              <Save size={16} />
              Enregistrer comme modèle
            </li>
          )}
          {!archive && canDelete && (
            <li
              className={`${styles.item} ${styles.delete}`}
              onClick={handleDeleteBoard}
            >
              <Trash size={16} />
              Supprimer le tableau
            </li>
          )}
        </ul>
      </div>
      <div id="modal-layout-opacity" onClick={(e) => setMore(false)}></div>
    </>
  );
}
