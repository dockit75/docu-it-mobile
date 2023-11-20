import { createSlice } from "@reduxjs/toolkit";
import { clearStorage, removeUserSession, storeUserSession } from "../storageManager";

const initialState = {
    // username: null,
    // isAuthenticated: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.username = action.payload.username;
            state.isAuthenticated = true;
            // storeUserSession(state);
        },
        clearUser: state => {
            state.username = null;
            state.isAuthenticated = false;
            // removeUserSession(); 
        },
        setNotificationCount: (state, action) => {
            state.notificationCount = action.payload.count;
        },
        setProfileCompletion: (state, action) => {
            state.profileCompletion = action.payload.percentage;
        }
    },
});

export const { setUser, clearUser, setNotificationCount, setProfileCompletion } = userSlice.actions;

export const selectUser = state => state?.user;

export default userSlice.reducer;
