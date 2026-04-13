import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { merchantFetchAPI } from "../services/api";

export const fetchMerchant = createAsyncThunk(
  "merchant/fetch",
  async (payload, { rejectWithValue }) => {
    try {
      console.log('payload >>>', payload);
      const response = await merchantFetchAPI(payload);
      console.log('response >>>', response)
      if (response.data?.status !== 0 && response.data?.status !== "00") {
        const errMsg = response.data?.errors?.[0]?.msg || response.data?.message;
        throw new Error(errMsg || "Merchant fetch failed");
      }
      console.log('Fetch By Merchant ID >>>', response.data);
      return response.data;
    } catch (err) {
      let errMsg = err.message || "Merchant fetch failed";

      if (err.response?.data) {
        const data = err.response.data;
        // Check Apigee gateway fault
        if (data.fault && data.fault.faultstring) {
          errMsg = `API Gateway Error: ${data.fault.faultstring}`;
        } else {
          errMsg = data.errors?.[0]?.msg || data.message || errMsg;
        }
      }

      return rejectWithValue(errMsg);
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
