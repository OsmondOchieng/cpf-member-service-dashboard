type AIInsightsProps = {
  totalRequests: number;
  resolvedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  averageTurnaround: string;
  darkMode: boolean;
};

export default function AIInsights({
  totalRequests,
  resolvedRequests,
  pendingRequests,
  inProgressRequests,
  averageTurnaround,
  darkMode,
}: AIInsightsProps) {
  const resolutionRate =
    totalRequests > 0
      ? ((resolvedRequests / totalRequests) * 100).toFixed(1)
      : "0.0";

  return (
    <section
      className={`mt-6 rounded-2xl border p-6 shadow-sm ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            AI INSIGHTS
          </p>

          <h2
            className={`text-xl font-bold ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Intelligent Service Analysis
          </h2>
        </div>

        <span
          className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${
            darkMode
              ? "bg-slate-800 text-slate-300"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          Prototype
        </span>
      </div>

      <div
        className={`mt-5 rounded-xl p-4 ${
          darkMode
            ? "bg-slate-800"
            : "bg-slate-50"
        }`}
      >
        <p
          className={`text-sm leading-6 ${
            darkMode
              ? "text-slate-300"
              : "text-slate-700"
          }`}
        >
          The dashboard currently contains{" "}
          <strong>{totalRequests}</strong> service requests.
          The current resolution rate is{" "}
          <strong>{resolutionRate}%</strong>, with{" "}
          <strong>{pendingRequests}</strong> pending and{" "}
          <strong>{inProgressRequests}</strong> in progress.
          The average turnaround for resolved requests is{" "}
          <strong>{averageTurnaround} days</strong>.
        </p>
      </div>

      <div
        className={`mt-4 rounded-xl border border-dashed p-4 ${
          darkMode
            ? "border-slate-700"
            : "border-slate-300"
        }`}
      >
        <p
          className={`text-sm font-semibold ${
            darkMode
              ? "text-white"
              : "text-slate-800"
          }`}
        >
          Planned AI integration
        </p>

        <p
          className={`mt-1 text-sm leading-6 ${
            darkMode
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          Future versions can connect this section to an AI
          service to identify trends, explain unusual patterns,
          summarise performance and recommend operational
          actions.
        </p>
      </div>
    </section>
  );
}