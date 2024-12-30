"use server";

import Task from "./Task";

export default async function Tasks({ tasks }) {
  return (
    <div>
      <ul>
        {tasks?.map((task) => {
          return <Task task={task} key={task?._id} />;
        })}
      </ul>
    </div>
  );
}
