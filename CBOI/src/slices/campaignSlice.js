import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { campaignUpdateAPI } from "../services/api";

export const updateCampaign = createAsyncThunk(
  "campaign/update",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await campaignUpdateAPI(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Campaign update failed"
      );
    }
  }
);

const campaignSlice = createSlice({
  name: "campaign",
  initialState: {
    loading: false,
    success: false,
    error: null,
    response: null,
  },
  reducers: {
    resetCampaign: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateCampaign.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.response = action.payload;
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;
