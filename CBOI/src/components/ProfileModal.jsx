import React from "react";
import { decodeToken } from "../services/api";

const getAuthToken = () => localStorage.getItem("token");

export default function ProfileModal({ isOpen, onClose, merchantData }) {
  if (!isOpen) return null;

  // Attempt to gracefully extract JWT data as a fallback when API fails
  const token = getAuthToken();
  const jwtPayload = token ? decodeToken(token) : {};
  
  // Extracted and normalized dynamic properties (API -> JWT Fallback -> UI Mock)
  const mName = merchantData?.merchant_name || merchantData?.name || jwtPayload?.name || jwtPayload?.given_name || "Stebin Ben";
  const mPhone = merchantData?.merchant_mobile || merchantData?.mobile || jwtPayload?.preferred_username || jwtPayload?.user_name || "+91 9398239231";
  
  const deviceSerial = merchantData?.serial_number || merchantData?.device_serial || "456954659876857";
  const linkedAccount = merchantData?.merchant_account_no || merchantData?.account_no || "XXXXXX6857";
  const upiId = merchantData?.vpa_id || merchantData?.vpa || jwtPayload?.upi_id || "rudransh.panigrahi@cbin";
  const ifscCode = merchantData?.ifsc || merchantData?.ifsc_code || jwtPayload?.bankCode ? `${jwtPayload.bankCode.toUpperCase()}0283896` : "CBOI0283896";
  const deviceModel = merchantData?.device_model || merchantData?.model_name || "Morefun ET389";
  const deviceMobile = merchantData?.device_mobile || merchantData?.sim_number || mPhone;
  const networkType = merchantData?.network_type || merchantData?.networkType || "BSNL";
  const deviceStatus = merchantData?.device_status || merchantData?.state || "Active";
  const batteryPct = merchantData?.battery_percentage || merchantData?.battery || "60%";
  const networkStrength = merchantData?.network_strength || merchantData?.signal || "Strong";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
        {/* Header */}
        <div className="flex items-center px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-slate-800">View Profile Details</h2>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {/* Basic Information */}
          <div className="border border-gray-200 rounded-lg mb-6 overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-[13px] font-semibold text-slate-700">Basic Information</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Name</span>
                <span className="text-[13px] font-semibold text-slate-800">{mName}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Phone</span>
                <span className="text-[13px] font-semibold text-slate-800">{mPhone}</span>
              </div>
            </div>
          </div>

          {/* Device Information */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-[13px] font-semibold text-slate-700">Device Information</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Device Serial Number</span>
                <span className="text-[13px] font-semibold text-slate-800">{deviceSerial}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Linked Account Number</span>
                <span className="text-[13px] font-semibold text-slate-800">{linkedAccount}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">UPI ID</span>
                <span className="text-[13px] font-semibold text-slate-800">{upiId}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">IFSC Code</span>
                <span className="text-[13px] font-semibold text-slate-800">{ifscCode}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Device Model Name</span>
                <span className="text-[13px] font-semibold text-slate-800">{deviceModel}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Device Mobile Number</span>
                <span className="text-[13px] font-semibold text-slate-800">{deviceMobile}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Network Type</span>
                <span className="text-[13px] font-semibold text-slate-800">{networkType}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Device Status</span>
                <span className="text-[13px] font-semibold text-slate-800">{deviceStatus}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Battery Percentage</span>
                <span className="text-[13px] font-semibold text-slate-800">{batteryPct}</span>
              </div>
              <div className="grid grid-cols-2">
                <span className="text-[13px] font-medium text-slate-500">Network Strength</span>
                <span className="text-[13px] font-semibold text-slate-800">{networkStrength}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#185bc5] hover:bg-blue-700 text-white text-[13px] font-medium px-6 py-2 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
