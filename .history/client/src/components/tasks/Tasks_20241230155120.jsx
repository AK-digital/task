"use server";

import Task from "./Task";

export default async function Tasks({ tasks }) {
  return (
    <div>
      {tasks?.map((task) => {
        return <Task key={task?._id} />;
      })}
    </div>
  );
}
