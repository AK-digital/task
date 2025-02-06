export default function Tasks({
  tasks: initialTasks,
  project,
  boardId,
  optimisticColor,
}) {
  // ... autres imports et état

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Ne rien faire si on dépose au même endroit
    if (source.index === destination.index) return;

    const newTasks = Array.from(tasks);
    const [reorderedTask] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, reorderedTask);

    // Mettre à jour l'état immédiatement pour une transition plus fluide
    setTasks(newTasks);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div
        className={styles["tasks"]}
        style={{
          borderLeft: `2px solid ${optimisticColor}`,
        }}
      >
        <Droppable
          droppableId={boardId}
          // Ajouter ces props pour optimiser le rendu
          mode="standard"
          renderClone={(provided, snapshot, rubric) => (
            <Task
              task={tasks[rubric.source.index]}
              project={project}
              index={rubric.source.index}
              provided={provided}
              isDragging={snapshot.isDragging}
            />
          )}
        >
          {(provided, snapshot) => (
            <div
              className={`${styles["tasks__list"]} ${
                snapshot.isDraggingOver
                  ? styles["tasks__list--dragging-over"]
                  : ""
              }`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {tasks?.map((task, index) => (
                <Task
                  key={task?._id}
                  task={task}
                  project={project}
                  index={index}
                />
              ))}
              {provided.placeholder}
              {/* ... reste du composant */}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
