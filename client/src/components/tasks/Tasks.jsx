import TaskWithSubtasks from "../Task/TaskWithSubtasks";
import { isNotEmpty } from "@/utils/utils";
import TasksHeader from "./TasksHeader";
import TaskSkeletons from "../Task/TaskSkeletons";
import { useMemo, useState, useEffect, memo } from "react";
import SelectedTasks from "./SelectedTasks";
import { useVirtualizedList } from "@/hooks/useVirtualizedList";

const Tasks = memo(function Tasks({
  project,
  tasks,
  tasksLoading,
  activeId,
  mutateTasks,
  displayedElts,
  displayedFilters,
  selectedTasks,
  setSelectedTasks,
  archive,
}) {

  const [sortedTasks, setSortedTasks] = useState(tasks || []);

  useEffect(() => {
    setSortedTasks(tasks || []);
  }, [tasks]);

  // Virtualisation pour les longues listes (plus de 50 tâches)
  const shouldVirtualize = sortedTasks.length > 50;
  
  const {
    visibleItems: visibleTasks,
    containerProps,
    innerProps,
  } = useVirtualizedList({
    items: sortedTasks,
    itemHeight: 40, // Hauteur d'une tâche
    containerHeight: 600, // Hauteur du conteneur
    overscan: 10,
  });

  return (
    <div className="relative">
      {tasksLoading ? (
        <TaskSkeletons displayedElts={displayedElts} />
      ) : (
        <div>
          {isNotEmpty(sortedTasks) ? (
            <>
              <TasksHeader
                displayedElts={displayedElts}
                displayedFilters={displayedFilters}
                tasks={tasks}
                setSortedTasks={setSortedTasks}
              />
              
              {/* Rendu conditionnel : virtualisé ou normal */}
              {shouldVirtualize ? (
                <div {...containerProps}>
                  <div {...innerProps}>
                    {visibleTasks.map((task) => (
                      <div key={task._id} style={task.style}>
                        <TaskWithSubtasks
                          task={task}
                          displayedElts={displayedElts}
                          setSelectedTasks={setSelectedTasks}
                          selectedTasks={selectedTasks}
                          isDragging={task._id === activeId}
                          mutate={mutateTasks}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                sortedTasks.map((task) => (
                  <TaskWithSubtasks
                    key={task._id}
                    task={task}
                    displayedElts={displayedElts}
                    setSelectedTasks={setSelectedTasks}
                    selectedTasks={selectedTasks}
                    isDragging={task._id === activeId}
                    mutate={mutateTasks}
                  />
                ))
              )}
              
              {isNotEmpty(selectedTasks) && (
                <SelectedTasks
                  project={project}
                  setSelectedTasks={setSelectedTasks}
                  selectedTasks={selectedTasks}
                  archive={archive}
                  mutate={mutateTasks}
                />
              )}
            </>
          ) : (
            <div className="text-center text-text-color-muted text-[1.4rem] pb-20 pt-10">
              <p>Aucune tâche trouvée</p>
              <p className="text-sm mt-2">Essayez de modifier vos filtres ou créez une nouvelle tâche</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default Tasks;
