import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    orderBy,
    limit,
    deleteDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';

const initialState = {
    items: [],
    unreadCount: 0,
    loading: false,
    error: null,
    lastFetched: null,
    hasMore: true
};

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchNotifications',
    async ({ userId, page = 1, pageSize = 20 }, { rejectWithValue }) => {
        try {
            const notificationsRef = collection(db, 'notifications');
            const q = query(
                notificationsRef,
                where('userId', '==', userId),
                orderBy('date', 'desc'),
                limit(pageSize)
            );

            const querySnapshot = await getDocs(q);
            const notifications = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const unreadCount = notifications.filter(n => !n.seen).length;

            return {
                notifications,
                unreadCount,
                hasMore: notifications.length === pageSize
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const markNotificationAsSeen = createAsyncThunk(
    'notifications/markAsSeen',
    async (notificationId, { rejectWithValue }) => {
        try {
            const notificationRef = doc(db, 'notifications', notificationId);
            await updateDoc(notificationRef, {
                seen: true,
                seenAt: new Date().toISOString()
            });
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const markAllNotificationsAsSeen = createAsyncThunk(
    'notifications/markAllAsSeen',
    async (userId, { getState, rejectWithValue }) => {
        try {
            const notifications = getState().notifications.items;
            const unseenNotifications = notifications.filter(n => !n.seen);

            const updates = unseenNotifications.map(notification =>
                updateDoc(doc(db, 'notifications', notification.id), {
                    seen: true,
                    seenAt: new Date().toISOString()
                })
            );

            await Promise.all(updates);
            return unseenNotifications.map(n => n.id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/deleteNotification',
    async (notificationId, { rejectWithValue }) => {
        try {
            await deleteDoc(doc(db, 'notifications', notificationId));
            return notificationId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteAllNotifications = createAsyncThunk(
    'notifications/deleteAll',
    async (userId, { getState, rejectWithValue }) => {
        try {
            const notifications = getState().notifications.items;
            const deletePromises = notifications.map(notification =>
                deleteDoc(doc(db, 'notifications', notification.id))
            );

            await Promise.all(deletePromises);
            return notifications.map(n => n.id);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            if (!action.payload.seen) {
                state.unreadCount += 1;
            }
        },
        clearNotifications: (state) => {
            state.items = [];
            state.unreadCount = 0;
            state.lastFetched = null;
            state.hasMore = true;
        },
        updateUnreadCount: (state) => {
            state.unreadCount = state.items.filter(n => !n.seen).length;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                const { notifications, unreadCount, hasMore } = action.payload;
                state.items = notifications;
                state.unreadCount = unreadCount;
                state.hasMore = hasMore;
                state.lastFetched = new Date().toISOString();
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(markNotificationAsSeen.fulfilled, (state, action) => {
                const notification = state.items.find(n => n.id === action.payload);
                if (notification && !notification.seen) {
                    notification.seen = true;
                    notification.seenAt = new Date().toISOString();
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })

            .addCase(markAllNotificationsAsSeen.fulfilled, (state, action) => {
                const notificationIds = action.payload;
                state.items = state.items.map(notification => {
                    if (notificationIds.includes(notification.id)) {
                        return {
                            ...notification,
                            seen: true,
                            seenAt: new Date().toISOString()
                        };
                    }
                    return notification;
                });
                state.unreadCount = 0;
            })

            .addCase(deleteNotification.fulfilled, (state, action) => {
                const deletedNotification = state.items.find(
                    n => n.id === action.payload
                );
                state.items = state.items.filter(n => n.id !== action.payload);
                if (deletedNotification && !deletedNotification.seen) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })

            .addCase(deleteAllNotifications.fulfilled, (state) => {
                state.items = [];
                state.unreadCount = 0;
            });
    }
});

export const {
    addNotification,
    clearNotifications,
    updateUnreadCount
} = notificationSlice.actions;

// Sélecteurs
export const selectNotifications = state => state.notifications.items;
export const selectUnseenNotifications = state =>
    state.notifications.items.filter(n => !n.seen);
export const selectUnseenNotificationsCount = state =>
    state.notifications.unreadCount;
export const selectNotificationsLoading = state =>
    state.notifications.loading;
export const selectNotificationsError = state =>
    state.notifications.error;
export const selectHasMoreNotifications = state =>
    state.notifications.hasMore;

export default notificationSlice.reducer;