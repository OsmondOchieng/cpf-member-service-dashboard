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

const CHANNEL_COLORS = [
  "#008C95",
  "#F5A623",
  "#64748B",
  "#94A3B8",
];

const requests = requestData as ServiceRequest[];

/*
  Prototype feedback data.
  The original dummy service-request dataset does not contain
  actual member satisfaction ratings.
*/
const prototypeFeedbackData = requests.map((request, index) => {
  const ratings = [5, 4, 4, 5, 3, 4, 5, 4, 3, 5];

  return {
    ...request,
    feedback_rating: ratings[index % ratings.length],
  };
});

/*
  Prototype contact-channel data.
  Production data should come from the approved member-service source.
*/
const prototypeChannelData = requests.map((request, index) => {
  const channels = [
    "Email",
    "Email",
    "Chatbot",
    "Phone",
    "Branch",
  ];

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
    KPI calculations use the complete filtered dataset,
    not only the 10 records currently visible in the table.
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

  const branchPerformance = BRANCH_OPTIONS.filter(
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

    const branchAverageTurnaround =
      branchResolved.length > 0
        ? branchResolved.reduce(
            (sum, request) => sum + request.turnaround_days,
            0
          ) / branchResolved.length
        : 0;

    return {
      branch,
      requests: branchRequests.length,
      resolutionRate: Number(branchResolutionRate.toFixed(1)),
      averageTurnaround: Number(
        branchAverageTurnaround.toFixed(1)
      ),
    };
  });

  const filteredRequestIds = new Set(
    filteredRequests.map((request) => request.request_id)
  );

  const filteredFeedback = prototypeFeedbackData.filter(
    (item) => filteredRequestIds.has(item.request_id)
  );

  const feedbackRatingData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating} Star`,
    responses: filteredFeedback.filter(
      (item) => item.feedback_rating === rating
    ).length,
  }));

  const averageSatisfaction =
    filteredFeedback.length > 0
      ? filteredFeedback.reduce(
          (sum, item) => sum + item.feedback_rating,
          0
        ) / filteredFeedback.length
      : 0;

  const positiveFeedback =
    filteredFeedback.length > 0
      ? (filteredFeedback.filter(
          (item) => item.feedback_rating >= 4
        ).length /
          filteredFeedback.length) *
        100
      : 0;

  const filteredChannels = prototypeChannelData.filter(
    (item) => filteredRequestIds.has(item.request_id)
  );

  const channelNames = [
    "Email",
    "Chatbot",
    "Phone",
    "Branch",
  ];

  const channelData = channelNames.map((channel) => ({
    name: channel,
    value: filteredChannels.filter(
      (item) => item.contact_channel === channel
    ).length,
  }));

  const topChannel =
    channelData.length > 0
      ? channelData.reduce((top, current) =>
          current.value > top.value ? current : top
        )
      : null;

  /*
    Pagination
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

  const displayedRequests = filteredRequests.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const resetFilters = () => {
    setStatusFilter("All");
    setBranchFilter("All");
    setRequestTypeFilter("All");
    setPriorityFilter("All");
    setSearchTerm("");
    setCurrentPage(1);
  };

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
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "cpf-member-service-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main
      className={`dashboard-shell ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      {/* ================= HEADER ================= */}

      <header className="top-header">
        <div className="header-inner">
          <div className="brand-area">
            <img
              src="/cpf-logo.png"
              alt="CPF Financial Services"
              className="cpf-logo"
            />

            <div className="brand-copy">
              <div className="organization-name">
                CPF FINANCIAL SERVICES
              </div>

              <h1>Member Service Request Dashboard</h1>

              <p>
                Operational view of member service requests,
                resolution status and turnaround performance.
              </p>
            </div>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? "☀ Light Mode" : "☾ Dark Mode"}
          </button>
        </div>

        <nav className="main-navigation">
          <a href="#dashboard">Dashboard</a>
          <a href="#feedback">Member Feedback</a>
          <a href="#reports">Reports</a>
          <a href="#ai-insights">AI Insights</a>
        </nav>
      </header>

      <div className="dashboard-container">
        {/* ================= DASHBOARD ================= */}

        <section id="dashboard" className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                OPERATIONS
              </span>

              <h2>Service Request Overview</h2>

              <p>
                Monitor workload, resolution performance
                and service turnaround.
              </p>
            </div>
          </div>

          {/* ================= FILTERS ================= */}

          <div className="filter-panel">
            <div className="filter-heading">
              <div>
                <h3>Search & Filters</h3>

                <p>
                  Narrow the dashboard to the operational
                  records you want to analyse.
                </p>
              </div>

              <div className="filter-count">
                Showing{" "}
                <strong>{totalRequests}</strong> of{" "}
                <strong>{requests.length}</strong> requests
              </div>
            </div>

            <div className="filter-grid">
              <div className="filter-field search-field">
                <label htmlFor="search">
                  Search requests
                </label>

                <div className="search-wrapper">
                  <span className="search-icon">
                    🔎
                  </span>

                  <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Request ID, branch, request type..."
                  />
                </div>
              </div>

              <FilterSelect
                label="Status"
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}
              />

              <FilterSelect
                label="Branch"
                value={branchFilter}
                options={BRANCH_OPTIONS}
                onChange={(value) => {
                  setBranchFilter(value);
                  setCurrentPage(1);
                }}
              />

              <FilterSelect
                label="Request Type"
                value={requestTypeFilter}
                options={requestTypes}
                onChange={(value) => {
                  setRequestTypeFilter(value);
                  setCurrentPage(1);
                }}
              />

              <FilterSelect
                label="Priority"
                value={priorityFilter}
                options={PRIORITY_OPTIONS}
                onChange={(value) => {
                  setPriorityFilter(value);
                  setCurrentPage(1);
                }}
              />

              <button
                type="button"
                className="reset-button"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* ================= KPI CARDS ================= */}

          <div className="kpi-grid">
            <KpiCard
              title="Total Requests"
              value={totalRequests}
              description="Current filtered workload"
              icon="◉"
            />

            <KpiCard
              title="Resolved"
              value={resolvedRequests.length}
              description={`${resolutionRate.toFixed(
                1
              )}% resolution rate`}
              icon="✓"
              accent="teal"
            />

            <KpiCard
              title="Pending"
              value={pendingRequests.length}
              description="Requests requiring follow-up"
              icon="!"
              accent="orange"
            />

            <KpiCard
              title="Avg. Turnaround"
              value={`${averageTurnaround.toFixed(
                1
              )} days`}
              description="Resolved requests only"
              icon="◷"
              accent="slate"
            />
          </div>

          {/* ================= CHARTS ================= */}

          <div className="chart-grid">
            <div className="dashboard-card">
              <div className="card-heading">
                <div>
                  <h3>Request Status Distribution</h3>

                  <p>
                    Current composition of the filtered
                    workload.
                  </p>
                </div>
              </div>

              <div className="chart-container">
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
                      cy="45%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {statusData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={
                            STATUS_COLORS[
                              entry.name as Status
                            ]
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        value,
                        "Requests",
                      ]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="chart-center-label">
                  <strong>{totalRequests}</strong>
                  <span>Requests</span>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-heading">
                <div>
                  <h3>Branch Performance</h3>

                  <p>
                    Resolution rate by branch.
                  </p>
                </div>
              </div>

              <div className="chart-container branch-chart">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={branchPerformance}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="branch"
                      tick={{
                        fontSize: 12,
                      }}
                    />

                    <YAxis
                      domain={[0, 100]}
                      tick={{
                        fontSize: 12,
                      }}
                      tickFormatter={(value) =>
                        `${value}%`
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        `${value}%`,
                        "Resolution Rate",
                      ]}
                    />

                    <Bar
                      dataKey="resolutionRate"
                      name="Resolution Rate"
                      fill="#008C95"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FEEDBACK ================= */}

        <section
          id="feedback"
          className="dashboard-section"
        >
          <div className="section-heading">
            <div>
              <span className="section-label">
                SERVICE QUALITY
              </span>

              <h2>Member Satisfaction & Feedback</h2>

              <p>
                Prototype analysis of member feedback and
                satisfaction.
              </p>
            </div>

            <span className="prototype-badge">
              PROTOTYPE DATA
            </span>
          </div>

          <div className="prototype-notice">
            <strong>Prototype / dummy feedback analysis.</strong>

            <span>
              {" "}
              Real production feedback would come from the
              approved member-service source.
            </span>
          </div>

          <div className="small-kpi-grid">
            <MiniMetric
              title="Average Rating"
              value={`${averageSatisfaction.toFixed(
                1
              )} / 5`}
              description="Prototype feedback sample"
            />

            <MiniMetric
              title="Feedback Responses"
              value={filteredFeedback.length}
              description="Prototype responses"
            />

            <MiniMetric
              title="Positive Feedback"
              value={`${positiveFeedback.toFixed(
                1
              )}%`}
              description="Ratings of 4 or 5"
            />
          </div>

          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h3>Feedback Rating Distribution</h3>

                <p>
                  Distribution of prototype satisfaction
                  ratings.
                </p>
              </div>
            </div>

            <div className="chart-container feedback-chart">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={feedbackRatingData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="rating"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="responses"
                    name="Responses"
                    fill="#008C95"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ================= CONTACT CHANNELS ================= */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                MEMBER BEHAVIOUR
              </span>

              <h2>Member Contact Channels</h2>

              <p>
                Prototype analysis of how members may
                contact the service team.
              </p>
            </div>

            <span className="prototype-badge">
              PROTOTYPE DATA
            </span>
          </div>

          <div className="dashboard-card channel-card">
            <div className="channel-layout">
              <div className="channel-chart">
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
                      cy="45%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                    >
                      {channelData.map(
                        (entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              CHANNEL_COLORS[
                                index %
                                  CHANNEL_COLORS.length
                              ]
                            }
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      formatter={(value) => [
                        value,
                        "Requests",
                      ]}
                    />

                    <Legend
                      verticalAlign="bottom"
                      height={36}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="channel-summary">
                <span className="summary-label">
                  Leading prototype channel
                </span>

                <strong>
                  {topChannel?.name || "N/A"}
                </strong>

                <span className="channel-value">
                  {topChannel?.value || 0} requests
                </span>

                <p>
                  In a production dashboard, this analysis
                  would help management understand member
                  behaviour and identify opportunities to
                  improve digital channels such as the
                  chatbot.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= TABLE ================= */}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                OPERATIONAL RECORDS
              </span>

              <h2>Service Request Details</h2>

              <p>
                Detailed records behind the dashboard
                summaries.
              </p>
            </div>
          </div>

          <div className="dashboard-card table-card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Branch</th>
                    <th>Request Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Turnaround</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedRequests.length > 0 ? (
                    displayedRequests.map((request) => (
                      <tr key={request.request_id}>
                        <td className="request-id">
                          {request.request_id}
                        </td>

                        <td>{request.branch}</td>

                        <td>{request.request_type}</td>

                        <td>
                          <PriorityBadge
                            priority={request.priority}
                          />
                        </td>

                        <td>
                          <StatusBadge
                            status={request.status}
                          />
                        </td>

                        <td>
                          {request.status ===
                          "Resolved"
                            ? `${request.turnaround_days} days`
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="no-results"
                      >
                        No service requests match the
                        selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>
                Showing{" "}
                {totalRequests === 0
                  ? 0
                  : startIndex + 1}{" "}
                –{" "}
                {Math.min(
                  startIndex + PAGE_SIZE,
                  totalRequests
                )}{" "}
                of {totalRequests} requests
              </span>

              <div className="pagination">
                <button
                  type="button"
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      Math.max(1, safeCurrentPage - 1)
                    )
                  }
                >
                  ← Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                )
                  .slice(0, 10)
                  .map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={
                        page === safeCurrentPage
                          ? "active-page"
                          : ""
                      }
                      onClick={() =>
                        setCurrentPage(page)
                      }
                    >
                      {page}
                    </button>
                  ))}

                <button
                  type="button"
                  disabled={
                    safeCurrentPage === totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        totalPages,
                        safeCurrentPage + 1
                      )
                    )
                  }
                >
                  Next →
                </button>
              </div>
            </div>

            <div className="table-note">
              The table displays 10 records per page where
              available. KPI calculations use the complete
              filtered dataset.
            </div>
          </div>
        </section>

        {/* ================= REPORTS ================= */}

        <section
          id="reports"
          className="dashboard-section"
        >
          <div className="section-heading">
            <div>
              <span className="section-label">
                REPORTING
              </span>

              <h2>Reports & Export</h2>

              <p>
                Export the currently filtered service-request
                records for further analysis or reporting.
              </p>
            </div>
          </div>

          <div className="report-grid">
            <div className="dashboard-card report-card">
              <div className="report-icon">▣</div>

              <div>
                <h3>Current Report</h3>

                <p>
                  {totalRequests} requests currently match
                  the selected filters and search criteria.
                </p>

                <button
                  type="button"
                  className="primary-button"
                  onClick={exportCSV}
                >
                  Export Filtered Data CSV
                </button>
              </div>
            </div>

            <div className="dashboard-card report-summary">
              <div className="report-summary-header">
                <div>
                  <h3>Operational Summary</h3>

                  <p>
                    Snapshot of the current filtered
                    workload.
                  </p>
                </div>
              </div>

              <div className="summary-grid">
                <div>
                  <span>Total workload</span>
                  <strong>{totalRequests}</strong>
                </div>

                <div>
                  <span>Resolved</span>
                  <strong>
                    {resolvedRequests.length}
                  </strong>
                </div>

                <div>
                  <span>Pending</span>
                  <strong>
                    {pendingRequests.length}
                  </strong>
                </div>

                <div>
                  <span>Resolution rate</span>
                  <strong>
                    {resolutionRate.toFixed(1)}%
                  </strong>
                </div>

                <div>
                  <span>Avg. turnaround</span>
                  <strong>
                    {averageTurnaround.toFixed(1)} days
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= AI ================= */}

        <section
          id="ai-insights"
          className="dashboard-section"
        >
          <div className="ai-card">
            <div className="ai-header">
              <div className="ai-icon">✦</div>

              <div>
                <span className="section-label">
                  FUTURE CAPABILITY
                </span>

                <h2>AI Insights</h2>

                <p>
                  Reserved space for future AI-powered
                  service request analysis.
                </p>
              </div>

              <span className="coming-badge">
                COMING NEXT
              </span>
            </div>

            <div className="ai-content">
              <h3>Planned AI capability</h3>

              <p>
                A future version could use AI to identify
                recurring request themes, summarise member
                feedback, highlight unusual workload
                patterns and suggest areas requiring
                management attention.
              </p>

              <div className="ai-capability-grid">
                <div>
                  <span>01</span>
                  <strong>Theme Detection</strong>
                  <p>
                    Identify recurring member-service
                    request themes.
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <strong>Feedback Summary</strong>
                  <p>
                    Summarise large volumes of member
                    feedback.
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <strong>Workload Alerts</strong>
                  <p>
                    Highlight unusual changes in workload
                    patterns.
                  </p>
                </div>

                <div>
                  <span>04</span>
                  <strong>Management Attention</strong>
                  <p>
                    Surface areas that may require
                    management review.
                  </p>
                </div>
              </div>
            </div>

            <div className="ai-footer">
              <strong>Important:</strong> AI outputs are
              not being presented as real in this prototype.
              Production AI would require approved data,
              governance and validation.
            </div>
          </div>
        </section>
      </div>

      {/* ================= FOOTER ================= */}

      <footer className="dashboard-footer">
        <div>
          <strong>CPF FINANCIAL SERVICES</strong>
          <span>Member Service Request Dashboard</span>
        </div>

        <p>
          Prototype dashboard using dummy CPF-style
          service-request data.
        </p>
      </footer>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="filter-field">
      <label>{label}</label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
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

function KpiCard({
  title,
  value,
  description,
  icon,
  accent = "teal",
}: {
  title: string;
  value: string | number;
  description: string;
  icon: string;
  accent?: "teal" | "orange" | "slate";
}) {
  return (
    <div className={`kpi-card ${accent}`}>
      <div className="kpi-top">
        <span>{title}</span>

        <div className="kpi-icon">{icon}</div>
      </div>

      <strong>{value}</strong>

      <p>{description}</p>
    </div>
  );
}

function MiniMetric({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="mini-metric">
      <span>{title}</span>

      <strong>{value}</strong>

      <p>{description}</p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const className =
    status === "Resolved"
      ? "status-resolved"
      : status === "Pending"
      ? "status-pending"
      : "status-progress";

  return (
    <span className={`status-badge ${className}`}>
      {status}
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: Priority;
}) {
  const className =
    priority === "Urgent"
      ? "priority-urgent"
      : priority === "High"
      ? "priority-high"
      : "priority-normal";

  return (
    <span className={`priority-badge ${className}`}>
      {priority}
    </span>
  );
}