import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../services/api';

const initialState = {
  stats: null,
  loading: false,
  error: null,
};

export const getStats = createAsyncThunk(
  'stats/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Không thể tải thống kê');
    }
  }
);

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(getStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = statsSlice.actions;
export default statsSlice.reducer;
