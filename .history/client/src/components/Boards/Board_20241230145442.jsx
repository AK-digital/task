import styles from "@/styles/components/boards/board.module.css";
export default function Board({ board }) {
  return (
    <div>
      {/* Board title */}
      <div>
        <span>{board?.title}</span>
      </div>
      {/* tasks */}
    </div>
  );
}
