import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { merchantFetchAPI } from "../../services/api";

export const fetchMerchant = createAsyncThunk(
  "merchant/fetch",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await merchantFetchAPI(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Merchant fetch failed"
      );
    }
  }
);

const merchantSlice = createSlice({
  name: "merchant",
  initialState: {
    loading: false,
    success: false,
    error: null,
    data: null,
  },
  reducers: {
    resetMerchant: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.data = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMerchant.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.data = null;
      })
      .addCase(fetchMerchant.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.data = action.payload;
      })
      .addCase(fetchMerchant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetMerchant } = merchantSlice.actions;
export default merchantSlice.reducer;
