"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import requestData from "../src/data/requests.json";

type Status = "Resolved" | "Pending" | "In Progress";
type Priority = "Normal" | "High" | "Urgent";

type ServiceRequest = {
  request_id: string;
  branch: string;
  request_type: string;
  priority: Priority;
  status: Status;
  turnaround_days: number;
};

const PAGE_SIZE = 10;

const STATUS_OPTIONS = ["All", "Resolved", "Pending", "In Progress"];

const BRANCH_OPTIONS = [
  "All",
  "Eldoret",
  "Kisumu",
  "Mombasa",
  "Nairobi",
  "Nakuru",
];

const PRIORITY_OPTIONS = ["All", "Normal", "High", "Urgent"];

const COLORS = {
  resolved: "#008C95",
  pending: "#F5A623",
  progress: "#6B7280",
};

export default function Home() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);

  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [requestTypeFilter, setRequestTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    setRequests(requestData as ServiceRequest[]);
  }, []);

  const requestTypes = useMemo(() => {
    const types = Array.from(
      new Set(requests.map((request) => request.request_type))
    );

    return ["All", ...types];
  }, [requests]);

  /*
   * FILTERING
   * This works on the complete dataset.
   */
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesBranch =
        branchFilter === "All" || request.branch === branchFilter;

      const matchesRequestType =
        requestTypeFilter === "All" ||
        request.request_type === requestTypeFilter;

      const matchesPriority =
        priorityFilter === "All" || request.priority === priorityFilter;

      return (
        matchesStatus &&
        matchesBranch &&
        matchesRequestType &&
        matchesPriority
      );
    });
  }, [
    requests,
    statusFilter,
    branchFilter,
    requestTypeFilter,
    priorityFilter,
  ]);

  /*
   * KPI CALCULATIONS
   * These use the complete filtered dataset,
   * NOT just the 10 records currently displayed.
   */
  const totalRequests = filteredRequests.length;

  const resolvedRequests = filteredRequests.filter(
    (request) => request.status === "Resolved"
  );

  const pendingRequests = filteredRequests.filter(
    (request) => request.status === "Pending"
  );

  const inProgressRequests = filteredRequests.filter(
    (request) => request.status === "In Progress"
  );

  const resolutionRate =
    totalRequests > 0
      ? (resolvedRequests.length / totalRequests) * 100
      : 0;

  const averageTurnaround =
    resolvedRequests.length > 0
      ? resolvedRequests.reduce(
          (total, request) => total + Number(request.turnaround_days),
          0
        ) / resolvedRequests.length
      : 0;

  /*
   * PAGINATION
   * 10 records are shown on each page.
   */
  const totalPages = Math.max(1, Math.ceil(totalRequests / PAGE_SIZE));

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const displayedRequests = filteredRequests.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const startRecord =
    totalRequests === 0 ? 0 : startIndex + 1;

  const endRecord = Math.min(
    startIndex + PAGE_SIZE,
    totalRequests
  );

  /*
   * STATUS CHART DATA
   */
  const statusData = [
    {
      name: "Resolved",
      value: resolvedRequests.length,
      color: COLORS.resolved,
    },
    {
      name: "Pending",
      value: pendingRequests.length,
      color: COLORS.pending,
    },
    {
      name: "In Progress",
      value: inProgressRequests.length,
      color: COLORS.progress,
    },
  ];

  /*
   * BRANCH PERFORMANCE DATA
   */
  const branchData = BRANCH_OPTIONS.filter(
    (branch) => branch !== "All"
  ).map((branch) => {
    const branchRequests = filteredRequests.filter(
      (request) => request.branch === branch
    );

    const branchResolved = branchRequests.filter(
      (request) => request.status === "Resolved"
    );

    const branchResolutionRate =
      branchRequests.length > 0
        ? (branchResolved.length / branchRequests.length) * 100
        : 0;

    const branchTurnaround =
      branchResolved.length > 0
        ? branchResolved.reduce(
            (total, request) =>
              total + Number(request.turnaround_days),
            0
          ) / branchResolved.length
        : 0;

    return {
      branch,
      requests: branchRequests.length,
      resolutionRate: Number(branchResolutionRate.toFixed(1)),
      turnaround: Number(branchTurnaround.toFixed(1)),
    };
  });

  /*
   * RESET FILTERS
   */
  function resetFilters() {
    setStatusFilter("All");
    setBranchFilter("All");
    setRequestTypeFilter("All");
    setPriorityFilter("All");
    setCurrentPage(1);
  }

  /*
   * FILTER CHANGES
   * Whenever a filter changes, return to page 1.
   */
  function changeStatus(value: string) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function changeBranch(value: string) {
    setBranchFilter(value);
    setCurrentPage(1);
  }

  function changeRequestType(value: string) {
    setRequestTypeFilter(value);
    setCurrentPage(1);
  }

  function changePriority(value: string) {
    setPriorityFilter(value);
    setCurrentPage(1);
  }

  /*
   * PAGINATION
   */
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }

  return (
    <main
      className={
        darkMode
          ? "min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300"
          : "min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300"
      }
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =========================
            HEADER
        ========================= */}

        <header
          className={
            darkMode
              ? "mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
              : "mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          }
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* CPF LOGO + TITLE */}

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-sm overflow-hidden">
                <img
                  src="/cpf-logo.png"
                  alt="CPF Financial Services"
                  className="h-full w-full object-contain p-2"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-[#007C83]">
                  CPF FINANCIAL SERVICES
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Member Service Request Dashboard
                </h1>

                <p
                  className={
                    darkMode
                      ? "mt-1 text-sm text-slate-400"
                      : "mt-1 text-sm text-slate-500"
                  }
                >
                  Operational view of member service requests, resolution
                  status and turnaround performance.
                </p>
              </div>
            </div>

            {/* DARK / LIGHT MODE */}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={
                darkMode
                  ? "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
                  : "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
              }
              aria-label="Toggle dark and light mode"
            >
              {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </header>

        {/* =========================
            FILTERS
        ========================= */}

        <section
          className={
            darkMode
              ? "mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
              : "mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          }
        >
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-lg font-bold">
                Dashboard Filters
              </h2>

              <p
                className={
                  darkMode
                    ? "text-sm text-slate-400"
                    : "text-sm text-slate-500"
                }
              >
                Filter the service request workload by operational criteria.
              </p>
            </div>

            <button
              onClick={resetFilters}
              className="rounded-xl bg-[#007C83] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#006970]"
            >
              Reset Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <FilterSelect
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={changeStatus}
              darkMode={darkMode}
            />

            <FilterSelect
              label="Branch"
              value={branchFilter}
              options={BRANCH_OPTIONS}
              onChange={changeBranch}
              darkMode={darkMode}
            />

            <FilterSelect
              label="Request Type"
              value={requestTypeFilter}
              options={requestTypes}
              onChange={changeRequestType}
              darkMode={darkMode}
            />

            <FilterSelect
              label="Priority"
              value={priorityFilter}
              options={PRIORITY_OPTIONS}
              onChange={changePriority}
              darkMode={darkMode}
            />

          </div>

          <div
            className={
              darkMode
                ? "mt-4 text-sm text-slate-400"
                : "mt-4 text-sm text-slate-500"
            }
          >
            Showing <strong>{totalRequests}</strong> of{" "}
            <strong>{requests.length}</strong> requests
          </div>
        </section>

        {/* =========================
            KPI CARDS
        ========================= */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <KpiCard
            title="Total Requests"
            value={totalRequests}
            subtitle="Current workload"
            darkMode={darkMode}
          />

          <KpiCard
            title="Resolved"
            value={resolvedRequests.length}
            subtitle={`${resolutionRate.toFixed(1)}% resolution rate`}
            darkMode={darkMode}
          />

          <KpiCard
            title="Pending"
            value={pendingRequests.length}
            subtitle="Requests awaiting action"
            darkMode={darkMode}
          />

          <KpiCard
            title="Avg. Turnaround"
            value={`${averageTurnaround.toFixed(1)} days`}
            subtitle="Resolved requests"
            darkMode={darkMode}
          />

        </section>

        {/* =========================
            CHARTS
        ========================= */}

        <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* STATUS DISTRIBUTION */}

          <div
            className={
              darkMode
                ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
                : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            }
          >
            <h2 className="text-lg font-bold">
              Request Status Distribution
            </h2>

            <p
              className={
                darkMode
                  ? "mb-4 text-sm text-slate-400"
                  : "mb-4 text-sm text-slate-500"
              }
            >
              Current workload composition.
            </p>

            <div className="h-72">

              {totalRequests > 0 ? (

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>

                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>

                    <Tooltip />

                  </PieChart>
                </ResponsiveContainer>

              ) : (

                <EmptyState darkMode={darkMode} />

              )}

            </div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-center">

              <StatusMini
                label="Resolved"
                value={resolvedRequests.length}
                darkMode={darkMode}
              />

              <StatusMini
                label="Pending"
                value={pendingRequests.length}
                darkMode={darkMode}
              />

              <StatusMini
                label="In Progress"
                value={inProgressRequests.length}
                darkMode={darkMode}
              />

            </div>
          </div>

          {/* BRANCH PERFORMANCE */}

          <div
            className={
              darkMode
                ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
                : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            }
          >
            <h2 className="text-lg font-bold">
              Branch Performance
            </h2>

            <p
              className={
                darkMode
                  ? "mb-4 text-sm text-slate-400"
                  : "mb-4 text-sm text-slate-500"
              }
            >
              Resolution rate by branch.
            </p>

            <div className="h-72">

              <ResponsiveContainer width="100%" height="100%">

                <BarChart data={branchData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    opacity={darkMode ? 0.15 : 0.5}
                  />

                  <XAxis dataKey="branch" />

                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />

                  <Tooltip
                    formatter={(value) => `${value}%`}
                  />

                  <Bar
                    dataKey="resolutionRate"
                    name="Resolution Rate"
                    fill="#007C83"
                    radius={[6, 6, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>
          </div>

        </section>

        {/* =========================
            SERVICE REQUEST DETAILS
        ========================= */}

        <section
          className={
            darkMode
              ? "overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm"
              : "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          }
        >

          <div className="p-5">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-bold">
                  Service Request Details
                </h2>

                <p
                  className={
                    darkMode
                      ? "text-sm text-slate-400"
                      : "text-sm text-slate-500"
                  }
                >
                  Detailed view of the currently filtered requests.
                </p>

              </div>

              <div
                className={
                  darkMode
                    ? "text-sm text-slate-400"
                    : "text-sm text-slate-500"
                }
              >
                Showing {startRecord}–{endRecord} of {totalRequests}
              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full text-left text-sm">

              <thead
                className={
                  darkMode
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-100 text-slate-700"
                }
              >

                <tr>

                  <th className="px-5 py-3 font-semibold">
                    Request ID
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Branch
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Request Type
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Priority
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-3 font-semibold">
                    Turnaround
                  </th>

                </tr>

              </thead>

              <tbody>

                {displayedRequests.map((request) => (

                  <tr
                    key={request.request_id}
                    className={
                      darkMode
                        ? "border-t border-slate-800 hover:bg-slate-800/60"
                        : "border-t border-slate-200 hover:bg-slate-50"
                    }
                  >

                    <td className="whitespace-nowrap px-5 py-3 font-medium">
                      {request.request_id}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      {request.branch}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      {request.request_type}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      <PriorityBadge priority={request.priority} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      <StatusBadge status={request.status} />
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      {request.status === "Resolved"
                        ? `${request.turnaround_days} days`
                        : "—"}
                    </td>

                  </tr>

                ))}

                {displayedRequests.length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center"
                    >
                      No service requests match the selected filters.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* PAGINATION */}

          <div
            className={
              darkMode
                ? "flex flex-col gap-3 border-t border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between"
                : "flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"
            }
          >

            <div>

              <p
                className={
                  darkMode
                    ? "text-sm text-slate-400"
                    : "text-sm text-slate-500"
                }
              >
                Showing 10 records per page where available.
              </p>

              <p
                className={
                  darkMode
                    ? "text-sm text-slate-400"
                    : "text-sm text-slate-500"
                }
              >
                Page {safeCurrentPage} of {totalPages}
              </p>

            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() => goToPage(safeCurrentPage - 1)}
                disabled={safeCurrentPage === 1}
                className={
                  safeCurrentPage === 1
                    ? "cursor-not-allowed rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-400 opacity-50"
                    : "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-100"
                }
              >
                ← Previous
              </button>

              <div className="hidden items-center gap-1 sm:flex">

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                )
                  .slice(
                    Math.max(0, safeCurrentPage - 3),
                    Math.min(totalPages, safeCurrentPage + 2)
                  )
                  .map((page) => (

                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={
                        page === safeCurrentPage
                          ? "rounded-lg bg-[#007C83] px-3 py-2 text-sm font-semibold text-white"
                          : darkMode
                          ? "rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                          : "rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100"
                      }
                    >
                      {page}
                    </button>

                  ))}

              </div>

              <button
                onClick={() => goToPage(safeCurrentPage + 1)}
                disabled={safeCurrentPage === totalPages}
                className={
                  safeCurrentPage === totalPages
                    ? "cursor-not-allowed rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-400 opacity-50"
                    : "rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition hover:bg-slate-100"
                }
              >
                Next →
              </button>

            </div>

          </div>

        </section>

        {/* =========================
            FOOTER
        ========================= */}

        <footer
          className={
            darkMode
              ? "mt-6 border-t border-slate-800 py-5 text-center text-sm text-slate-500"
              : "mt-6 border-t border-slate-200 py-5 text-center text-sm text-slate-500"
          }
        >
          CPF Financial Services · Member Service Request Dashboard
          <br />
          Prototype using dummy data
        </footer>

      </div>
    </main>
  );
}

/* =========================
   FILTER COMPONENT
========================= */

function FilterSelect({
  label,
  value,
  options,
  onChange,
  darkMode,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  darkMode: boolean;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={
          darkMode
            ? "w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white outline-none focus:border-[#007C83] focus:ring-2 focus:ring-[#007C83]/20"
            : "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#007C83] focus:ring-2 focus:ring-[#007C83]/20"
        }
      >

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}

/* =========================
   KPI CARD
========================= */

function KpiCard({
  title,
  value,
  subtitle,
  darkMode,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  darkMode: boolean;
}) {
  return (
    <div
      className={
        darkMode
          ? "rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      }
    >

      <p
        className={
          darkMode
            ? "text-sm font-medium text-slate-400"
            : "text-sm font-medium text-slate-500"
        }
      >
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight">
        {value}
      </p>

      <p className="mt-1 text-sm font-medium text-[#007C83]">
        {subtitle}
      </p>

    </div>
  );
}

/* =========================
   STATUS MINI CARD
========================= */

function StatusMini({
  label,
  value,
  darkMode,
}: {
  label: string;
  value: number;
  darkMode: boolean;
}) {
  return (
    <div
      className={
        darkMode
          ? "rounded-xl bg-slate-800 p-3"
          : "rounded-xl bg-slate-50 p-3"
      }
    >

      <p
        className={
          darkMode
            ? "text-xs text-slate-400"
            : "text-xs text-slate-500"
        }
      >
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>

    </div>
  );
}

/* =========================
   STATUS BADGE
========================= */

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const classes =
    status === "Resolved"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Pending"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {status}
    </span>
  );
}

/* =========================
   PRIORITY BADGE
========================= */

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const classes =
    priority === "Urgent"
      ? "bg-red-100 text-red-700"
      : priority === "High"
      ? "bg-orange-100 text-orange-700"
      : "bg-blue-100 text-blue-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {priority}
    </span>
  );
}

/* =========================
   EMPTY STATE
========================= */

function EmptyState({
  darkMode,
}: {
  darkMode: boolean;
}) {
  return (
    <div className="flex h-full items-center justify-center">

      <p
        className={
          darkMode
            ? "text-sm text-slate-500"
            : "text-sm text-slate-400"
        }
      >
        No data available for the selected filters.
      </p>

    </div>
  );
}