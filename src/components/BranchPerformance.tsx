"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Request = {
  branch: string;
  turnaround_days: number | null;
  status: string;
};

type Props = {
  requests: Request[];
  darkMode: boolean;
};

export default function BranchPerformance({
  requests,
  darkMode,
}: Props) {
  const branches = [
    "Nairobi",
    "Mombasa",
    "Kisumu",
    "Nakuru",
    "Eldoret",
  ];

  const data = branches.map((branch) => {
    const branchRequests = requests.filter(
      (request) =>
        request.branch === branch &&
        request.status === "Resolved" &&
        request.turnaround_days !== null
    );

    const average =
      branchRequests.length > 0
        ? branchRequests.reduce(
            (sum, request) =>
              sum + (request.turnaround_days ?? 0),
            0
          ) / branchRequests.length
        : 0;

    return {
      branch,
      turnaround: Number(average.toFixed(1)),
    };
  });

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <h2
        className={`text-lg font-semibold ${
          darkMode
            ? "text-white"
            : "text-slate-900"
        }`}
      >
        Average Turnaround by Branch
      </h2>

      <p
        className={`mt-1 text-xs ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        Average number of days taken to resolve requests.
      </p>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="branch" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="turnaround"
              name="Days"
              fill="#2563eb"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}