import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import uiReducer from './slices/uiSlice';

const store = configureStore({
    reducer: {
        auth:          authReducer,
        notifications: notificationReducer,
        ui:            uiReducer,
    },
    devTools: import.meta.env.DEV,
});

export default store;
