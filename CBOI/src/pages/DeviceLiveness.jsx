import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { checkDeviceLiveness, resetDevice } from "../redux/slices/deviceSlice";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLoader from "../components/PageLoader";

const initialForm = {
  column2: "",
  column6: "",
};

export default function DeviceLiveness() {
  const dispatch = useDispatch();
  const { loading, success, error, response } = useSelector((state) => state.device);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    return () => dispatch(resetDevice());
  }, [dispatch]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      checkDeviceLiveness({
        key: "device_liveness",
        message: form,
      })
    );
  };

  const handleReset = () => {
    setForm(initialForm);
    dispatch(resetDevice());
  };

  return (
    <PageLoader>
    <div>
      <PageHeader
        title="Device Liveness"
        subtitle="Check the real-time liveness status of soundbox devices"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18" />
          </svg>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Device Liveness Check</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            id="column2"
            label="Device ID (Column 2)"
            placeholder="Enter device ID"
            value={form.column2}
            onChange={handleChange("column2")}
          />
          <FormField
            id="column6"
            label="Status / Token (Column 6)"
            placeholder="Enter status or token"
            value={form.column6}
            onChange={handleChange("column6")}
          />

          {(success || error) && (
            <Alert
              type={success ? "success" : "error"}
              message={success ? "Device liveness check completed!" : error}
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? <LoadingSpinner label="Checking..." /> : "Check Liveness"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 text-sm"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Response Card */}
      {success && response && (
        <div className="mt-4 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Response</h3>
          <pre className="text-xs text-slate-600 bg-slate-50 rounded-lg p-4 overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">API Endpoint</p>
        <code className="text-xs text-slate-600">POST /CBOI/isu_soundbox/lang/status_update · key: device_liveness</code>
      </div>
    </div>
    </PageLoader>
  );
}
