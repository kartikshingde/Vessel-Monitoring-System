import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

//  Fetch all captains
export const fetchCaptains = createAsyncThunk(
  'users/fetchCaptains',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/users?role=captain');
      return data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch captains');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState: {
    captains: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCaptains.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCaptains.fulfilled, (state, action) => {
        state.loading = false;
        state.captains = action.payload;
      })
      .addCase(fetchCaptains.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
