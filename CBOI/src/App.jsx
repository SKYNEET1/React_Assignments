import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import CallbackPage from "./pages/CallbackPage";
import Dashboard from "./pages/Dashboard";
import { useSelector } from "react-redux";
import LanguageUpdate from "./pages/LanguageUpdate";
import DeviceLiveness from "./pages/DeviceLiveness";
import CampaignUpdate from "./pages/CampaignUpdate";
import MerchantFetch from "./pages/MerchantFetch";
import RaiseTicket from "./pages/RaiseTicket";
import ViewTickets from "./pages/ViewTickets";
import TransactionReports from "./pages/TransactionReports";
import QrDetails from "./pages/QrDetails";
import Layout from "./components/Layout";

function PrivateRoute({ children }) {
  const token = useSelector((state) => state.auth.token);
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/callback" element={<CallbackPage />} />
        
        <Route element={<PrivateRoute><Layout><Outlet /></Layout></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/language-update" element={<LanguageUpdate />} />
          <Route path="/device-liveness" element={<DeviceLiveness />} />
          <Route path="/campaign-update" element={<CampaignUpdate />} />
          <Route path="/merchant-fetch" element={<MerchantFetch />} />
          <Route path="/raise-ticket" element={<RaiseTicket />} />
          <Route path="/view-tickets" element={<ViewTickets />} />
          <Route path="/transaction-reports" element={<TransactionReports />} />
          <Route path="/qr-details" element={<QrDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;