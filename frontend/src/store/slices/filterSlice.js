import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    searchTerm: '',
    filters: {
        status: [],
        priority: [],
        assignee: [],
        dueDate: null
    },
    sortBy: 'createdAt',
    sortDirection: 'desc'
};

const filterSlice = createSlice({
    name: 'filters',
    initialState,
    reducers: {
        setSearchTerm: (state, action) => {
            state.searchTerm = action.payload;
        },
        setFilter: (state, action) => {
            const { type, value } = action.payload;
            state.filters[type] = value;
        },
        setSorting: (state, action) => {
            const { field, direction } = action.payload;
            state.sortBy = field;
            state.sortDirection = direction;
        },
        clearFilters: (state) => {
            state.searchTerm = '';
            state.filters = initialState.filters;
        }
    }
});

export const {
    setSearchTerm,
    setFilter,
    setSorting,
    clearFilters
} = filterSlice.actions;

export default filterSlice.reducer;
