import authReducer from "../src/features/auth/authSlice"
import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "./slices/languageSlice";
import deviceReducer from "./slices/deviceSlice";
import campaignReducer from "./slices/campaignSlice";
import merchantReducer from "./slices/merchantSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    language: languageReducer,
    device: deviceReducer,
    campaign: campaignReducer,
    merchant: merchantReducer,
  },
});

export default store;
