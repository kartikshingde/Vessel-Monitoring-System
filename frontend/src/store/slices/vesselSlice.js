import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

//  Async thunk: Fetch vessels from API
export const fetchVessels = createAsyncThunk(
  'vessels/fetchVessels',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/vessels');
      return data.data; // Return vessels array
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vessels');
    }
  }
);

//  Async thunk: Update vessel (assign captain)
export const updateVessel = createAsyncThunk(
  'vessels/updateVessel',
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/vessels/${id}`, updates);
      return data.data; // Return updated vessel
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update vessel');
    }
  }
);

//  Slice: Define state + reducers
const vesselSlice = createSlice({
  name: 'vessels',
  initialState: {
    vessels: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Synchronous action to clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    //  Handle fetchVessels states
    builder
      .addCase(fetchVessels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVessels.fulfilled, (state, action) => {
        state.loading = false;
        state.vessels = action.payload; // Store vessels in state
      })
      .addCase(fetchVessels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      //  Handle updateVessel states
      .addCase(updateVessel.fulfilled, (state, action) => {
        // Update vessel in array (optimistic update)
        const index = state.vessels.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.vessels[index] = action.payload;
        }
      });
  },
});

export const { clearError } = vesselSlice.actions;
export default vesselSlice.reducer;
