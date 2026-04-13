export default function PageHeader({ title, subtitle, icon }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      {icon && (
        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-[#1a3c6e]">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
