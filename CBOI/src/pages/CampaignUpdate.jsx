import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCampaign, resetCampaign } from "../redux/slices/campaignSlice";
import PageHeader from "../components/PageHeader";
import FormField from "../components/FormField";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import PageLoader from "../components/PageLoader";

const initialForm = {
  column2: "",
  column3: "",
  column9: "",
};

const fieldLabels = {
  column2: { label: "Device ID (Column 2)", placeholder: "Enter device ID" },
  column3: { label: "Campaign ID (Column 3)", placeholder: "Enter campaign ID" },
  column9: { label: "Campaign Data (Column 9)", placeholder: "Enter campaign data" },
};

export default function CampaignUpdate() {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.campaign);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    return () => dispatch(resetCampaign());
  }, [dispatch]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      updateCampaign({
        key: "campaign_update",
        message: form,
      })
    );
  };

  const handleReset = () => {
    setForm(initialForm);
    dispatch(resetCampaign());
  };

  return (
    <PageLoader>
    <div>
      <PageHeader
        title="Campaign Update"
        subtitle="Manage and push campaign updates to soundbox devices"
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-700 mb-5">Campaign Update Form</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {Object.keys(initialForm).map((key) => (
            <FormField
              key={key}
              id={key}
              label={fieldLabels[key].label}
              placeholder={fieldLabels[key].placeholder}
              value={form[key]}
              onChange={handleChange(key)}
            />
          ))}

          {(success || error) && (
            <Alert
              type={success ? "success" : "error"}
              message={success ? "Campaign updated successfully!" : error}
            />
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? <LoadingSpinner label="Updating..." /> : "Update Campaign"}
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

      <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">API Endpoint</p>
        <code className="text-xs text-slate-600">POST /CBOI/isu_soundbox/lang/status_update · key: campaign_update</code>
      </div>
    </div>
    </PageLoader>
  );
}
