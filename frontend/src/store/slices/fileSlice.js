// src/store/slices/fileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const uploadFiles = createAsyncThunk(
    'files/upload',
    async ({ files, userId, projectId, taskId }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));

            formData.append('userId', userId);
            formData.append('projectId', projectId);
            formData.append('taskId', taskId);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const fileSlice = createSlice({
    name: 'files',
    initialState: {
        uploads: [],
        loading: false,
        error: null
    },
    reducers: {
        clearUploads: (state) => {
            state.uploads = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(uploadFiles.pending, (state) => {
                state.loading = true;
            })
            .addCase(uploadFiles.fulfilled, (state, action) => {
                state.loading = false;
                state.uploads = [...state.uploads, ...action.payload];
            })
            .addCase(uploadFiles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearUploads } = fileSlice.actions;
export default fileSlice.reducer;