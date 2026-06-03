import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
    name: 'notifications',
    initialState: {
        items:       [],
        unreadCount: 0,
        isLoading:   false,
    },
    reducers: {
        setNotifications: (state, action) => {
            state.items       = action.payload.data || [];
            state.unreadCount = action.payload.unread_count || 0;
        },
        addNotification: (state, action) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
        markAsRead: (state, action) => {
            const notif = state.items.find((n) => n.id === action.payload);
            if (notif && !notif.read_at) {
                notif.read_at = new Date().toISOString();
                state.unreadCount = Math.max(0, state.unreadCount - 1);
            }
        },
        markAllRead: (state) => {
            state.items       = state.items.map((n) => ({ ...n, read_at: new Date().toISOString() }));
            state.unreadCount = 0;
        },
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setNotifications,
    addNotification,
    markAsRead,
    markAllRead,
    setLoading: setNotifLoading,
} = notificationSlice.actions;

export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount   = (state) => state.notifications.unreadCount;

export default notificationSlice.reducer;
