import { configureStore } from '@reduxjs/toolkit';
import vesselReducer from './slices/vesselSlice';
import userReducer from './slices/userSlice';

// Create Redux store with slices
export const store = configureStore({
  reducer: {
    vessels: vesselReducer, // Manage vessel state
    users: userReducer,     // Manage users/captains state
  },
});
