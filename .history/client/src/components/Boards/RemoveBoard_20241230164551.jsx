import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function RemoveBoard() {
  async function handleDeleteBoard(e) {
    e.preventDefault();
    await deleteBoard(board?._id, projectId);
  }

  return (
    <div>
      <FontAwesomeIcon icon={faTrash} onClick={handleDeleteBoard} />
    </div>
  );
}
