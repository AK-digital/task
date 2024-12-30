"use server";

import { getBoards } from "@/api/board";

export default async function Project({ params }) {
  const { id } = await params;

  const boards = await getBoards(id);

  console.log(boards);
  return (
    <main>
      <div>
        {/* Boards */}

        <div></div>
      </div>
    </main>
  );
}
