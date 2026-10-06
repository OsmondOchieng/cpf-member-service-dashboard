type AIInsightsProps = {
  totalRequests: number;
  resolvedRequests: number;
  pendingRequests: number;
  inProgressRequests: number;
  averageTurnaround: number;
};

export default function AIInsights({
  totalRequests,
  resolvedRequests,
  pendingRequests,
  inProgressRequests,
  averageTurnaround,
}: AIInsightsProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#006B7A]/20 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-[#006B7A] to-[#005766] p-5 text-white">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>

              <h2 className="text-lg font-semibold">
                AI Service Insights
              </h2>
            </div>

            <p className="mt-1 text-sm text-white/80">
              AI integration space for analysing the current dashboard data.
            </p>
          </div>

          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            AI Integration
          </span>
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            Current Data Context
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            The future AI layer will receive the currently filtered dashboard
            data and use it to answer operational questions and generate
            contextual insights.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Requests</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {totalRequests}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Resolved</p>
              <p className="mt-1 text-xl font-bold text-green-700">
                {resolvedRequests}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Pending</p>
              <p className="mt-1 text-xl font-bold text-orange-600">
                {pendingRequests}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Avg. Turnaround</p>
              <p className="mt-1 text-xl font-bold text-[#006B7A]">
                {averageTurnaround.toFixed(1)} days
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-5">
          <p className="text-sm font-semibold text-slate-900">
            Planned AI Capabilities
          </p>

          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li>• Explain important patterns in the current data.</li>
            <li>• Answer questions about service-request performance.</li>
            <li>• Highlight pending or potentially delayed workload.</li>
            <li>• Summarise branch and request-type performance.</li>
            <li>• Provide management-oriented observations.</li>
          </ul>

          <div className="mt-5 rounded-lg border border-dashed border-[#006B7A]/30 bg-white p-4">
            <p className="text-sm font-semibold text-[#006B7A]">
              AI connection point
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              The actual AI service will be connected through a secure
              server-side route. No API key is stored in the browser.
            </p>

            <button
              disabled
              className="mt-3 cursor-not-allowed rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-500"
            >
              AI Analysis — Coming Next
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
        In the current prototype, this section is an AI-ready integration
        space and does not claim to generate live AI responses yet.
      </div>
    </section>
  );
}