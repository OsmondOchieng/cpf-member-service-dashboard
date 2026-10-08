"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

const STATUS_OPTIONS = [
  "All",
  "Resolved",
  "Pending",
  "In Progress",
];

const BRANCH_OPTIONS = [
  "All",
  "Eldoret",
  "Kisumu",
  "Mombasa",
  "Nairobi",
  "Nakuru",
];

const PRIORITY_OPTIONS = [
  "All",
  "Normal",
  "High",
  "Urgent",
];

const STATUS_COLORS = {
  Resolved: "#008C95",
  Pending: "#F5A623",
  "In Progress": "#64748B",
};

const SATISFACTION_COLORS = [
  "#008C95",
  "#2CA6A4",
  "#F5A623",
  "#94A3B8",
  "#CBD5E1",
];

const CHANNEL_COLORS = [
  "#008C95",
  "#F5A623",
  "#64748B",
  "#94A3B8",
];

const requests = requestData as ServiceRequest[];

/*
  BUSINESS NOTE:
  The original prototype dataset does not contain customer feedback
  or contact-channel fields.

  Therefore these values are clearly labelled as PROTOTYPE / DUMMY DATA.
  They are generated consistently from the request index so that the
  dashboard can demonstrate the intended analysis without pretending
  that these are real member measurements.
*/

const prototypeFeedbackData = requests.map((request, index) => {
  const ratings = [5, 4, 4, 5, 3, 4, 5, 4, 3, 5];
  const rating = ratings[index % ratings.length];

  return {
    ...request,
    feedback_rating: rating,
  };
});

const prototypeChannelData = requests.map((request, index) => {
  const channels = ["Email", "Email", "Chatbot", "Phone", "Branch"];

  return {
    ...request,
    contact_channel: channels[index % channels.length],
  };
});

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [requestTypeFilter, setRequestTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [darkMode, setDarkMode] = useState(false);

  const requestTypes = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(requests.map((request) => request.request_type))
      ),
    ];
  }, []);

  /*
    FILTERED REQUESTS
    This is the main dataset used by the dashboard.
  */

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "All" ||
        request.status === statusFilter;

      const matchesBranch =
        branchFilter === "All" ||
        request.branch === branchFilter;

      const matchesRequestType =
        requestTypeFilter === "All" ||
        request.request_type === requestTypeFilter;

      const matchesPriority =
        priorityFilter === "All" ||
        request.priority === priorityFilter;

      const matchesSearch =
        search === "" ||
        request.request_id.toLowerCase().includes(search) ||
        request.branch.toLowerCase().includes(search) ||
        request.request_type.toLowerCase().includes(search) ||
        request.priority.toLowerCase().includes(search) ||
        request.status.toLowerCase().includes(search);

      return (
        matchesStatus &&
        matchesBranch &&
        matchesRequestType &&
        matchesPriority &&
        matchesSearch
      );
    });
  }, [
    statusFilter,
    branchFilter,
    requestTypeFilter,
    priorityFilter,
    searchTerm,
  ]);

  /*
    KPI CALCULATIONS
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
          (sum, request) => sum + request.turnaround_days,
          0
        ) / resolvedRequests.length
      : 0;

  /*
    PAGINATION
  */

  const totalPages = Math.max(
    1,
    Math.ceil(totalRequests / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const startIndex =
    (safeCurrentPage - 1) * PAGE_SIZE;

  const endIndex = Math.min(
    startIndex + PAGE_SIZE,
    totalRequests
  );

  const displayedRequests = filteredRequests.slice(
    startIndex,
    endIndex
  );

  /*
    STATUS CHART
  */

  const statusData = [
    {
      name: "Resolved",
      value: resolvedRequests.length,
    },
    {
      name: "Pending",
      value: pendingRequests.length,
    },
    {
      name: "In Progress",
      value: inProgressRequests.length,
    },
  ];

  /*
    BRANCH PERFORMANCE
  */

  const branchData = useMemo(() => {
    const branches = Array.from(
      new Set(filteredRequests.map((request) => request.branch))
    );

    return branches.map((branch) => {
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

      const branchAverageTurnaround =
        branchResolved.length > 0
          ? branchResolved.reduce(
              (sum, request) =>
                sum + request.turnaround_days,
              0
            ) / branchResolved.length
          : 0;

      return {
        branch,
        requests: branchRequests.length,
        resolved: branchResolved.length,
        resolutionRate: Number(
          branchResolutionRate.toFixed(1)
        ),
        turnaround: Number(
          branchAverageTurnaround.toFixed(1)
        ),
      };
    });
  }, [filteredRequests]);

  /*
    CUSTOMER SATISFACTION
    PROTOTYPE / DUMMY DATA ONLY
  */

  const filteredFeedback = useMemo(() => {
    const filteredIds = new Set(
      filteredRequests.map((request) => request.request_id)
    );

    return prototypeFeedbackData.filter((request) =>
      filteredIds.has(request.request_id)
    );
  }, [filteredRequests]);

  const satisfactionDistribution = useMemo(() => {
    return [1, 2, 3, 4, 5].map((rating) => ({
      rating: `${rating} Star`,
      count: filteredFeedback.filter(
        (item) => item.feedback_rating === rating
      ).length,
    }));
  }, [filteredFeedback]);

  const averageSatisfaction =
    filteredFeedback.length > 0
      ? filteredFeedback.reduce(
          (sum, item) => sum + item.feedback_rating,
          0
        ) / filteredFeedback.length
      : 0;

  const positiveFeedbackPercentage =
    filteredFeedback.length > 0
      ? (filteredFeedback.filter(
          (item) => item.feedback_rating >= 4
        ).length /
          filteredFeedback.length) *
        100
      : 0;

  /*
    CONTACT CHANNEL ANALYSIS
    PROTOTYPE / DUMMY DATA ONLY
  */

  const filteredChannels = useMemo(() => {
    const filteredIds = new Set(
      filteredRequests.map((request) => request.request_id)
    );

    return prototypeChannelData.filter((request) =>
      filteredIds.has(request.request_id)
    );
  }, [filteredRequests]);

  const channelData = useMemo(() => {
    const channels = [
      "Email",
      "Chatbot",
      "Phone",
      "Branch",
    ];

    return channels.map((channel) => ({
      name: channel,
      value: filteredChannels.filter(
        (item) => item.contact_channel === channel
      ).length,
    }));
  }, [filteredChannels]);

  const topChannel =
    [...channelData].sort(
      (a, b) => b.value - a.value
    )[0]?.name || "N/A";

  /*
    RESET FILTERS
  */

  const resetFilters = () => {
    setStatusFilter("All");
    setBranchFilter("All");
    setRequestTypeFilter("All");
    setPriorityFilter("All");
    setSearchTerm("");
    setCurrentPage(1);
  };

  /*
    FILTER HELPERS
  */

  const updateStatus = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const updateBranch = (value: string) => {
    setBranchFilter(value);
    setCurrentPage(1);
  };

  const updateRequestType = (value: string) => {
    setRequestTypeFilter(value);
    setCurrentPage(1);
  };

  const updatePriority = (value: string) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  const updateSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  /*
    CSV EXPORT
  */

  const exportCSV = () => {
    const headers = [
      "Request ID",
      "Branch",
      "Request Type",
      "Priority",
      "Status",
      "Turnaround Days",
    ];

    const rows = filteredRequests.map((request) => [
      request.request_id,
      request.branch,
      request.request_type,
      request.priority,
      request.status,
      request.turnaround_days,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "cpf-member-service-report.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
    PAGE NAVIGATION
  */

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  /*
    THEME CLASSES
  */

  const pageBackground = darkMode
    ? "bg-slate-950 text-slate-100"
    : "bg-slate-100 text-slate-900";

  const cardBackground = darkMode
    ? "border-slate-800 bg-slate-900"
    : "border-slate-200 bg-white";

  const mutedText = darkMode
    ? "text-slate-400"
    : "text-slate-500";

  const tableHeader = darkMode
    ? "bg-slate-800 text-slate-300"
    : "bg-slate-50 text-slate-600";

  const tableRow = darkMode
    ? "border-slate-800 hover:bg-slate-800/60"
    : "border-slate-100 hover:bg-slate-50";

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${pageBackground}`}
    >
      {/* =========================================================
          HEADER
      ========================================================== */}

      <header
        className={`border-b ${
          darkMode
            ? "border-slate-800 bg-slate-950"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              {/* CPF LOGO */}
              <div className="shrink-0">
                <img
                  src="/cpf-logo.png"
                  alt="CPF Financial Services"
                  className="h-16 w-auto object-contain sm:h-20"
                />
              </div>

              {/* HEADER TEXT */}
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.22em] text-[#008C95] sm:text-sm">
                  CPF FINANCIAL SERVICES
                </div>

                <h1
                  className={`mt-1 text-2xl font-bold tracking-tight sm:text-3xl ${
                    darkMode
                      ? "text-white"
                      : "text-slate-900"
                  }`}
                >
                  Member Service Request Dashboard
                </h1>

                <p
                  className={`mt-2 max-w-2xl text-sm sm:text-base ${mutedText}`}
                >
                  Operational view of member service requests,
                  resolution status and turnaround performance.
                </p>
              </div>
            </div>

            {/* THEME BUTTON */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg border border-[#008C95] px-4 py-2 text-sm font-semibold text-[#008C95] transition hover:bg-[#008C95] hover:text-white"
            >
              {darkMode
                ? "☀️ Light Mode"
                : "🌙 Dark Mode"}
            </button>
          </div>

          {/* =====================================================
              NAVIGATION
          ====================================================== */}

          <nav className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <a
              href="#dashboard"
              className="rounded-md px-3 py-2 text-sm font-medium text-[#008C95] hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Dashboard
            </a>

            <a
              href="#feedback"
              className={`rounded-md px-3 py-2 text-sm font-medium ${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              Member Feedback
            </a>

            <a
              href="#reports"
              className={`rounded-md px-3 py-2 text-sm font-medium ${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              Reports
            </a>

            <a
              href="#ai-insights"
              className={`rounded-md px-3 py-2 text-sm font-medium ${mutedText} hover:bg-slate-100 dark:hover:bg-slate-800`}
            >
              AI Insights
            </a>
          </nav>
        </div>
      </header>

      <div
        id="dashboard"
        className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8"
      >
        {/* =======================================================
            SEARCH + FILTERS
        ======================================================== */}

        <section
          className={`rounded-xl border p-5 shadow-sm ${cardBackground}`}
        >
          <div className="mb-4">
            <h2 className="text-lg font-bold">
              Search & Filters
            </h2>

            <p className={`mt-1 text-sm ${mutedText}`}>
              Narrow the dashboard to the operational records
              you want to analyse.
            </p>
          </div>

          {/* SEARCH */}

          <div className="mb-4">
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-semibold"
            >
              Search requests
            </label>

            <input
              id="search"
              type="text"
              value={searchTerm}
              onChange={(event) =>
                updateSearch(event.target.value)
              }
              placeholder="Search request ID, branch, request type..."
              className={`w-full rounded-lg border px-4 py-3 text-sm outline-none transition focus:border-[#008C95] focus:ring-2 focus:ring-[#008C95]/20 ${
                darkMode
                  ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500"
                  : "border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          {/* FILTERS */}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <FilterSelect
              label="Status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={updateStatus}
              darkMode={darkMode}
            />

            <FilterSelect
              label="Branch"
              value={branchFilter}
              options={BRANCH_OPTIONS}
              onChange={updateBranch}
              darkMode={darkMode}
            />

            <FilterSelect
              label="Request Type"
              value={requestTypeFilter}
              options={requestTypes}
              onChange={updateRequestType}
              darkMode={darkMode}
            />

            <FilterSelect
              label="Priority"
              value={priorityFilter}
              options={PRIORITY_OPTIONS}
              onChange={updatePriority}
              darkMode={darkMode}
            />

            <button
              type="button"
              onClick={resetFilters}
              className="mt-auto rounded-lg border border-[#008C95] px-4 py-3 text-sm font-semibold text-[#008C95] transition hover:bg-[#008C95] hover:text-white"
            >
              Reset Filters
            </button>
          </div>

          <div className="mt-4 text-sm font-medium">
            Showing{" "}
            <span className="font-bold text-[#008C95]">
              {totalRequests}
            </span>{" "}
            of{" "}
            <span className="font-bold">
              {requests.length}
            </span>{" "}
            requests
          </div>
        </section>

        {/* =======================================================
            KPI CARDS
        ======================================================== */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Requests"
            value={totalRequests}
            subtitle="Current filtered workload"
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
            subtitle="Requests requiring follow-up"
            darkMode={darkMode}
          />

          <KpiCard
            title="Avg. Turnaround"
            value={`${averageTurnaround.toFixed(1)} days`}
            subtitle="Resolved requests only"
            darkMode={darkMode}
          />
        </section>

        {/* =======================================================
            STATUS + BRANCH
        ======================================================== */}

        <section className="grid gap-6 lg:grid-cols-2">
          {/* STATUS DISTRIBUTION */}

          <div
            className={`rounded-xl border p-5 shadow-sm ${cardBackground}`}
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold">
                Request Status Distribution
              </h2>

              <p className={`text-sm ${mutedText}`}>
                Current composition of the filtered workload.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
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
                        fill={
                          STATUS_COLORS[
                            entry.name as keyof typeof STATUS_COLORS
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BRANCH PERFORMANCE */}

          <div
            className={`rounded-xl border p-5 shadow-sm ${cardBackground}`}
          >
            <div className="mb-4">
              <h2 className="text-lg font-bold">
                Branch Performance
              </h2>

              <p className={`text-sm ${mutedText}`}>
                Resolution rate by branch.
              </p>
            </div>

            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="branch" />

                  <YAxis />

                  <Tooltip />

                  <Bar
                    dataKey="resolutionRate"
                    name="Resolution Rate %"
                    fill="#008C95"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* =======================================================
            CUSTOMER SATISFACTION
        ======================================================== */}

        <section
          id="feedback"
          className={`rounded-xl border p-5 shadow-sm ${cardBackground}`}
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Member Satisfaction & Feedback
              </h2>

              <p className={`text-sm ${mutedText}`}>
                Prototype / dummy feedback analysis. Real
                production feedback would come from the approved
                member-service source.
              </p>
            </div>

            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              PROTOTYPE DATA
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard
              title="Average Rating"
              value={`${averageSatisfaction.toFixed(1)} / 5`}
              subtitle="Prototype feedback sample"
              darkMode={darkMode}
            />

            <KpiCard
              title="Feedback Responses"
              value={filteredFeedback.length}
              subtitle="Prototype responses"
              darkMode={darkMode}
            />

            <KpiCard
              title="Positive Feedback"
              value={`${positiveFeedbackPercentage.toFixed(
                1
              )}%`}
              subtitle="Ratings of 4 or 5"
              darkMode={darkMode}
            />
          </div>

          <div className="mt-6 h-72">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart data={satisfactionDistribution}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="rating" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Responses"
                  fill="#008C95"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* =======================================================
            CONTACT CHANNEL
        ======================================================== */}

        <section
          className={`rounded-xl border p-5 shadow-sm ${cardBackground}`}
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                Member Contact Channels
              </h2>

              <p className={`text-sm ${mutedText}`}>
                Prototype analysis of how members may contact
                the service team.
              </p>
            </div>

            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              PROTOTYPE DATA
            </span>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="h-72">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <PieChart>
                  <Pie
                    data={channelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {channelData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={
                          CHANNEL_COLORS[
                            index % CHANNEL_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col justify-center">
              <div
                className={`rounded-lg p-5 ${
                  darkMode
                    ? "bg-slate-800"
                    : "bg-slate-50"
                }`}
              >
                <p
                  className={`text-sm font-medium ${mutedText}`}
                >
                  Leading prototype channel
                </p>

                <p className="mt-2 text-3xl font-bold text-[#008C95]">
                  {topChannel}
                </p>

                <p
                  className={`mt-3 text-sm leading-6 ${mutedText}`}
                >
                  In a production dashboard, this analysis
                  would help management understand member
                  behaviour and identify opportunities to
                  improve digital channels such as the chatbot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            SERVICE REQUEST TABLE
        ======================================================== */}

        <section
          className={`rounded-xl border shadow-sm ${cardBackground}`}
        >
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="text-lg font-bold">
              Service Request Details
            </h2>

            <p className={`mt-1 text-sm ${mutedText}`}>
              Detailed records behind the dashboard summaries.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className={tableHeader}>
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
                {displayedRequests.length > 0 ? (
                  displayedRequests.map((request) => (
                    <tr
                      key={request.request_id}
                      className={`border-t ${tableRow}`}
                    >
                      <td className="px-5 py-4 font-semibold">
                        {request.request_id}
                      </td>

                      <td className="px-5 py-4">
                        {request.branch}
                      </td>

                      <td className="px-5 py-4">
                        {request.request_type}
                      </td>

                      <td className="px-5 py-4">
                        <PriorityBadge
                          priority={request.priority}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={request.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        {request.status === "Resolved"
                          ? `${request.turnaround_days} days`
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className={`px-5 py-10 text-center ${mutedText}`}
                    >
                      No requests match the current search
                      and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}

          <div className="flex flex-col gap-4 border-t border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className={`text-sm ${mutedText}`}>
              Showing{" "}
              {totalRequests === 0
                ? 0
                : startIndex + 1}{" "}
              – {endIndex} of {totalRequests} requests
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  goToPage(safeCurrentPage - 1)
                }
                disabled={safeCurrentPage === 1}
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  safeCurrentPage === 1
                    ? "cursor-not-allowed opacity-40"
                    : "hover:border-[#008C95] hover:text-[#008C95]"
                }`}
              >
                ← Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, index) => index + 1
              ).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                    page === safeCurrentPage
                      ? "bg-[#008C95] text-white"
                      : "border hover:border-[#008C95] hover:text-[#008C95]"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  goToPage(safeCurrentPage + 1)
                }
                disabled={
                  safeCurrentPage === totalPages
                }
                className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                  safeCurrentPage === totalPages
                    ? "cursor-not-allowed opacity-40"
                    : "hover:border-[#008C95] hover:text-[#008C95]"
                }`}
              >
                Next →
              </button>
            </div>
          </div>

          <div className={`px-5 pb-5 text-xs ${mutedText}`}>
            The table displays 10 records per page where
            available. KPI calculations use the complete
            filtered dataset.
          </div>
        </section>

        {/* =======================================================
            REPORTS
        ======================================================== */}

        <section
          id="reports"
          className={`rounded-xl border p-5 shadow-sm ${cardBackground}`}
        >
          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Reports & Export
            </h2>

            <p className={`mt-1 text-sm ${mutedText}`}>
              Export the currently filtered service-request
              records for further analysis or reporting.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div
              className={`rounded-lg border p-5 ${
                darkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <h3 className="font-bold">
                Current Report
              </h3>

              <p className={`mt-2 text-sm ${mutedText}`}>
                {totalRequests} requests currently match the
                selected filters and search criteria.
              </p>

              <button
                type="button"
                onClick={exportCSV}
                className="mt-4 rounded-lg bg-[#008C95] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#006970]"
              >
                Export Filtered Data CSV
              </button>
            </div>

            <div
              className={`rounded-lg border p-5 ${
                darkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <h3 className="font-bold">
                Operational Summary
              </h3>

              <div className={`mt-3 space-y-2 text-sm ${mutedText}`}>
                <p>
                  Total workload:{" "}
                  <strong>{totalRequests}</strong>
                </p>

                <p>
                  Resolved:{" "}
                  <strong>
                    {resolvedRequests.length}
                  </strong>
                </p>

                <p>
                  Pending:{" "}
                  <strong>
                    {pendingRequests.length}
                  </strong>
                </p>

                <p>
                  Resolution rate:{" "}
                  <strong>
                    {resolutionRate.toFixed(1)}%
                  </strong>
                </p>

                <p>
                  Average turnaround:{" "}
                  <strong>
                    {averageTurnaround.toFixed(1)} days
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================
            AI INSIGHTS
        ======================================================== */}

        <section
          id="ai-insights"
          className={`rounded-xl border p-5 shadow-sm ${cardBackground}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">
                AI Insights
              </h2>

              <p className={`mt-1 text-sm ${mutedText}`}>
                Reserved space for future AI-powered service
                request analysis.
              </p>
            </div>

            <span className="w-fit rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              COMING NEXT
            </span>
          </div>

          <div
            className={`mt-5 rounded-lg border p-5 ${
              darkMode
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <h3 className="font-bold">
              Planned AI capability
            </h3>

            <p className={`mt-2 text-sm leading-6 ${mutedText}`}>
              A future version could use AI to identify
              recurring request themes, summarise member
              feedback, highlight unusual workload patterns
              and suggest areas requiring management attention.
            </p>
          </div>
        </section>

        {/* =======================================================
            PROTOTYPE NOTE
        ======================================================== */}

        <footer
          className={`rounded-xl border p-5 text-sm ${cardBackground}`}
        >
          <p className={`leading-6 ${mutedText}`}>
            <strong className="text-[#008C95]">
              Prototype notice:
            </strong>{" "}
            This dashboard uses dummy CPF-style service-request
            data for demonstration and development. The
            satisfaction and contact-channel sections are
            prototype examples and should be connected to
            approved production data before operational use.
          </p>
        </footer>
      </div>
    </main>
  );
}

/* =============================================================
   REUSABLE FILTER COMPONENT
============================================================= */

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
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`w-full rounded-lg border px-3 py-3 text-sm outline-none focus:border-[#008C95] focus:ring-2 focus:ring-[#008C95]/20 ${
          darkMode
            ? "border-slate-700 bg-slate-800 text-white"
            : "border-slate-300 bg-white text-slate-900"
        }`}
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

/* =============================================================
   KPI CARD
============================================================= */

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
      className={`rounded-xl border p-5 shadow-sm ${darkMode
        ? "border-slate-800 bg-slate-900"
        : "border-slate-200 bg-white"
      }`}
    >
      <p className="text-sm font-semibold text-[#008C95]">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

      <p
        className={`mt-2 text-xs ${
          darkMode
            ? "text-slate-400"
            : "text-slate-500"
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

/* =============================================================
   STATUS BADGE
============================================================= */

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const styles = {
    Resolved:
      "bg-emerald-100 text-emerald-700",
    Pending:
      "bg-amber-100 text-amber-700",
    "In Progress":
      "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* =============================================================
   PRIORITY BADGE
============================================================= */

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const styles = {
    Normal:
      "bg-slate-100 text-slate-700",
    High:
      "bg-orange-100 text-orange-700",
    Urgent:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles[priority]}`}
    >
      {priority}
    </span>
  );
}