import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        sidebarOpen:   true,
        sidebarMobile: false,
        theme:         localStorage.getItem('theme') || 'light', // 'light' | 'dark'
    },
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        toggleMobileSidebar: (state) => {
            state.sidebarMobile = !state.sidebarMobile;
        },
        closeMobileSidebar: (state) => {
            state.sidebarMobile = false;
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
            document.documentElement.classList.toggle('dark', action.payload === 'dark');
        },
    },
});

export const {
    toggleSidebar,
    setSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
    setTheme,
} = uiSlice.actions;

export const selectSidebarOpen   = (state) => state.ui.sidebarOpen;
export const selectMobileSidebar = (state) => state.ui.sidebarMobile;
export const selectTheme         = (state) => state.ui.theme;

export default uiSlice.reducer;
