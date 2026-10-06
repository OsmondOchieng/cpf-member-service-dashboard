type ServiceRequest = {
  request_id: string;
  request_type: string;
  branch: string;
  status: string;
  priority: string;
  submitted_date: string;
  turnaround_days: number | null;
};

type Props = {
  requests: ServiceRequest[];
  darkMode: boolean;
};

export default function RequestTable({
  requests,
  darkMode,
}: Props) {
  return (
    <section
      className={`mt-6 overflow-hidden rounded-2xl border shadow-sm ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="p-5">
        <h2
          className={`text-lg font-semibold ${
            darkMode
              ? "text-white"
              : "text-slate-900"
          }`}
        >
          Service Request Details
        </h2>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? "text-slate-400"
              : "text-slate-500"
          }`}
        >
          Showing {requests.length} filtered requests.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">

          <thead
            className={
              darkMode
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-50 text-slate-600"
            }
          >
            <tr>
              <th className="px-5 py-3 font-semibold">
                Request ID
              </th>

              <th className="px-5 py-3 font-semibold">
                Request Type
              </th>

              <th className="px-5 py-3 font-semibold">
                Branch
              </th>

              <th className="px-5 py-3 font-semibold">
                Status
              </th>

              <th className="px-5 py-3 font-semibold">
                Priority
              </th>

              <th className="px-5 py-3 font-semibold">
                Submitted
              </th>

              <th className="px-5 py-3 font-semibold">
                Turnaround
              </th>
            </tr>
          </thead>

          <tbody>
            {requests.map((request) => (
              <tr
                key={request.request_id}
                className={`border-t ${
                  darkMode
                    ? "border-slate-800"
                    : "border-slate-100"
                }`}
              >
                <td
                  className={`px-5 py-3 font-medium ${
                    darkMode
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  {request.request_id}
                </td>

                <td className="px-5 py-3">
                  {request.request_type}
                </td>

                <td className="px-5 py-3">
                  {request.branch}
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      request.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : request.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {request.status}
                  </span>
                </td>

                <td className="px-5 py-3">
                  {request.priority}
                </td>

                <td className="px-5 py-3">
                  {request.submitted_date}
                </td>

                <td className="px-5 py-3">
                  {request.turnaround_days !== null
                    ? `${request.turnaround_days} days`
                    : "—"}
                </td>
              </tr>
            ))}

            {requests.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  No requests match the selected filters.
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </section>
  );
}