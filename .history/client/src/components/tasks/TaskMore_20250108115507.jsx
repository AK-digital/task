import styles from "@/styles/components/tasks/task-more.module.css";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export default function TaskMore({ setTaskMore }) {
  function handleClose(e) {
    e.preventDefault();
    const elt = e.target;
    const parentElt = elt.parentElement;

    parentElt.classList.add(styles.close);

    // parentElt?.addEventListener("animationend", function (e) {
    //   setTaskMore(false);
    // });
  }
  return (
    <div className={styles.container}>
      {/* Description */}
      <div onClick={handleClose}>
        <FontAwesomeIcon icon={faClose} />
      </div>
      <div>
        <label>Description</label>
        <textarea name="description" id="description"></textarea>
      </div>
      {/* Conversation */}
      <div></div>
    </div>
  );
}
