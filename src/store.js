import { configureStore } from "@reduxjs/toolkit";
import userReducer from './slices/UserSlices';

export const store = configureStore ({
    reducer : {
        user: userReducer,
    }
});

