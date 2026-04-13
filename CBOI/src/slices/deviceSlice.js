import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { deviceLivenessAPI } from "../services/api";

export const checkDeviceLiveness = createAsyncThunk(
  "device/liveness",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await deviceLivenessAPI(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Device liveness check failed"
      );
    }
  }
);

const deviceSlice = createSlice({
  name: "device",
  initialState: {
    loading: false,
    success: false,
    error: null,
    response: null,
  },
  reducers: {
    resetDevice: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkDeviceLiveness.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(checkDeviceLiveness.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.response = action.payload;
      })
      .addCase(checkDeviceLiveness.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDevice } = deviceSlice.actions;
export default deviceSlice.reducer;
