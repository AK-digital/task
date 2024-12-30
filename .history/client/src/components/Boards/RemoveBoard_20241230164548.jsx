import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function RemoveBoard() {
  return (
    <div>
      <FontAwesomeIcon icon={faTrash} onClick={handleDeleteBoard} />
    </div>
  );
}
