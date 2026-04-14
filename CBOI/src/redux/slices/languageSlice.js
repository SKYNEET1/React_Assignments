import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { submitLanguageUpdateAPI } from "../../services/api";

export const updateLanguage = createAsyncThunk(
  "language/update",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await submitLanguageUpdateAPI(payload);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Language update failed"
      );
    }
  }
);

const languageSlice = createSlice({
  name: "language",
  initialState: {
    loading: false,
    success: false,
    error: null,
    response: null,
  },
  reducers: {
    resetLanguage: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.response = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateLanguage.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateLanguage.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.response = action.payload;
      })
      .addCase(updateLanguage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetLanguage } = languageSlice.actions;
export default languageSlice.reducer;
