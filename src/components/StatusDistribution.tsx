"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type Request = {
  status: string;
};

type Props = {
  requests: Request[];
  darkMode: boolean;
};

export default function StatusDistribution({
  requests,
  darkMode,
}: Props) {
  const statuses = [
    "Resolved",
    "Pending",
    "In Progress",
  ];

  const data = statuses.map((status) => ({
    name: status,
    value: requests.filter(
      (request) => request.status === status
    ).length,
  }));

  const colors = [
    "#16a34a",
    "#f59e0b",
    "#2563eb",
  ];

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
        Requests by Status
      </h2>

      <p
        className={`mt-1 text-xs ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        Distribution of service request statuses.
      </p>

      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={85}
              label
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={colors[index]}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}