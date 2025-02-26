import styles from "@/styles/components/boards/board-more.module.css";
import { Archive, ArchiveRestore, Trash } from "lucide-react";
import { deleteBoard } from "@/actions/board";
import { addBoardToArchive, removeBoardFromArchive } from "@/api/board";

export default function BoardMore({ projectId, board, setMore, archive }) {
  console.log(board);
  const isBoardArchived = board?.archived;
  async function handleDeleteBoard() {
    const confirmed = confirm("Supprimer ce tableau ?");

    if (!confirmed) return;

    await deleteBoard(board?._id, projectId);
  }

  const handleAddArchive = async (e) => {
    e.preventDefault();
    await addBoardToArchive(board?._id, projectId);
  };

  const handleRestoreBoard = async (e) => {
    e.preventDefault();
    await removeBoardFromArchive(board?._id, projectId);
  };

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
          {!archive && (
            <li className={styles.item} onClick={handleDeleteBoard}>
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
