type KPICardProps = {
  title: string;
  value: string | number;
  description: string;
  darkMode: boolean;
};

export default function KPICard({
  title,
  value,
  description,
  darkMode,
}: KPICardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <p
        className={`text-sm font-medium ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-2 text-3xl font-bold ${
          darkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>

      <p
        className={`mt-2 text-xs ${
          darkMode
            ? "text-slate-500"
            : "text-slate-400"
        }`}
      >
        {description}
      </p>
    </div>
  );
}