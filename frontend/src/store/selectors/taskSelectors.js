// src/store/selectors/taskSelectors.js
import { createSelector } from '@reduxjs/toolkit';

const selectAllTasks = state => {
    const currentProject = state.projects.currentProject;
    return currentProject?.boards?.flatMap(board =>
        board.tasks.map(task => ({
            ...task,
            boardId: board.id,
            boardTitle: board.title
        }))
    ) || [];
};

const selectFilters = state => state.filters;

export const selectFilteredTasks = createSelector(
    [selectAllTasks, selectFilters],
    (tasks, filters) => {
        let filteredTasks = tasks;

        // Recherche textuelle
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filteredTasks = filteredTasks.filter(task =>
                task.text.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filtres
        if (filters.filters.status.length) {
            filteredTasks = filteredTasks.filter(task =>
                filters.filters.status.includes(task.status)
            );
        }

        if (filters.filters.priority.length) {
            filteredTasks = filteredTasks.filter(task =>
                filters.filters.priority.includes(task.priority)
            );
        }

        if (filters.filters.assignee.length) {
            filteredTasks = filteredTasks.filter(task =>
                filters.filters.assignee.includes(task.assignedTo)
            );
        }

        if (filters.filters.dueDate) {
            const filterDate = new Date(filters.filters.dueDate);
            filteredTasks = filteredTasks.filter(task => {
                if (!task.deadline) return false;
                const taskDate = new Date(task.deadline);
                return taskDate <= filterDate;
            });
        }

        // Tri
        filteredTasks.sort((a, b) => {
            let comparison = 0;
            switch (filters.sortBy) {
                case 'createdAt':
                    comparison = new Date(b.createdAt) - new Date(a.createdAt);
                    break;
                case 'deadline':
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    comparison = new Date(a.deadline) - new Date(b.deadline);
                    break;
                case 'priority':
                    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
                    comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
                case 'status':
                    const statusOrder = { blocked: 0, idle: 1, processing: 2, testing: 3, completed: 4 };
                    comparison = statusOrder[a.status] - statusOrder[b.status];
                    break;
                default:
                    comparison = 0;
            }
            return filters.sortDirection === 'asc' ? comparison : -comparison;
        });

        return filteredTasks;
    }
);