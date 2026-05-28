import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import facebookReducer from './slices/facebookSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    post: postReducer,
    facebook: facebookReducer,
  },
});

export default store;
