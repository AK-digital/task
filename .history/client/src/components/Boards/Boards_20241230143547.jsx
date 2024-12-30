import Board from "./Board";

export default function Boards({ boards }) {
  return (
    <div>
      {boards.map((board) => {
        return <Board board={board} />;
      })}
    </div>
  );
}
