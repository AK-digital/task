import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFilter,
    faSort,
    faTimes,
    faSortAmountUp,
    faSortAmountDown
} from "@fortawesome/free-solid-svg-icons";
import { StatusSelect, PrioritySelect, UserSelect } from './shared/SelectComponents';
import { useDebounce } from '../hooks/useDebounce';
import {
    setSearchTerm,
    setFilter,
    setSorting,
    clearFilters
} from '../store/slices/filterSlice';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '../config/constants';

const SORT_OPTIONS = [
    { value: 'createdAt', label: 'Date de création' },
    { value: 'deadline', label: 'Date limite' },
    { value: 'priority', label: 'Priorité' },
    { value: 'status', label: 'Statut' }
];

const TaskFilters = () => {
    const dispatch = useDispatch();
    const filters = useSelector(state => state.filters);
    const users = useSelector(state => state.projects.users);

    const [isExpanded, setIsExpanded] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.searchTerm);
    const debouncedSearch = useDebounce(searchInput, 300);

    useEffect(() => {
        dispatch(setSearchTerm(debouncedSearch));
    }, [debouncedSearch, dispatch]);

    const handleFilterChange = (type, value) => {
        dispatch(setFilter({ type, value }));
    };

    const handleSortChange = (field) => {
        const newDirection = field === filters.sortBy
            ? (filters.sortDirection === 'asc' ? 'desc' : 'asc')
            : 'asc';

        dispatch(setSorting({
            field,
            direction: newDirection
        }));
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.searchTerm) count++;
        if (filters.filters.status.length) count++;
        if (filters.filters.priority.length) count++;
        if (filters.filters.assignee.length) count++;
        if (filters.filters.dueDate) count++;
        return count;
    };

    return (
        <div className="task-filters">
            <div className="filters-header">
                <button
                    className="toggle-filters-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <FontAwesomeIcon icon={faFilter} />
                    Filtres
                    {getActiveFiltersCount() > 0 && (
                        <span className="filters-count">
                            {getActiveFiltersCount()}
                        </span>
                    )}
                </button>

                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Rechercher une tâche..."
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                    />
                    {searchInput && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchInput('')}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="filters-content">
                    <div className="filters-group">
                        <div className="filter-item">
                            <label>Statut</label>
                            <StatusSelect
                                isMulti
                                value={filters.filters.status}
                                onChange={values => handleFilterChange('status', values)}
                                options={STATUS_OPTIONS}
                            />
                        </div>

                        <div className="filter-item">
                            <label>Priorité</label>
                            <PrioritySelect
                                isMulti
                                value={filters.filters.priority}
                                onChange={values => handleFilterChange('priority', values)}
                                options={PRIORITY_OPTIONS}
                            />
                        </div>

                        <div className="filter-item">
                            <label>Assigné à</label>
                            <UserSelect
                                isMulti
                                users={users}
                                value={filters.filters.assignee}
                                onChange={values => handleFilterChange('assignee', values)}
                            />
                        </div>

                        <div className="filter-item">
                            <label>Date limite</label>
                            <div className="date-range-picker">
                                <input
                                    type="date"
                                    value={filters.filters.dueDate || ''}
                                    onChange={e => handleFilterChange('dueDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="sort-group">
                        <label>Trier par</label>
                        <div className="sort-options">
                            {SORT_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    className={`sort-option ${filters.sortBy === option.value ? 'active' : ''}`}
                                    onClick={() => handleSortChange(option.value)}
                                >
                                    {option.label}
                                    {filters.sortBy === option.value && (
                                        <FontAwesomeIcon
                                            icon={filters.sortDirection === 'asc' ? faSortAmountUp : faSortAmountDown}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="clear-filters"
                        onClick={() => {
                            dispatch(clearFilters());
                            setSearchInput('');
                        }}
                        disabled={getActiveFiltersCount() === 0}
                    >
                        <FontAwesomeIcon icon={faTimes} />
                        Réinitialiser les filtres
                    </button>
                </div>
            )}
        </div>
    );
};

export default TaskFilters;