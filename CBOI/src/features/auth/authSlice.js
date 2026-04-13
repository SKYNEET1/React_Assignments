import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  vpaList: [],
  selectedVpa: localStorage.getItem("selected_vpa") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    setVpaList(state, action) {
      state.vpaList = action.payload;
    },
    setSelectedVpa(state, action) {
      state.selectedVpa = action.payload;
      localStorage.setItem("selected_vpa", action.payload);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.vpaList = [];
      state.selectedVpa = null;
      localStorage.clear();
    },
  },
});

export const { setAuth, setVpaList, setSelectedVpa, logout } = authSlice.actions;
export default authSlice.reducer;