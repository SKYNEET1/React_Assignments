export default function PageHeader({ title }) {
  return (
    <div 
      className="flex items-center mb-8 w-full max-w-[1128px]"
      style={{ height: '40px', opacity: 1 }}
    >
      <h1 className="text-[20px] font-bold text-slate-800 leading-[40px] lowercase first-letter:uppercase">
        {title}
      </h1>
    </div>
  );
}
