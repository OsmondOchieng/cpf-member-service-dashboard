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

const STATUS_COLORS = {
  Resolved: "#42A4C1",
  Pending: "#EC006A",
  "In Progress": "#64748B",
};

const CHANNEL_COLORS = [
  "#42A4C1",
  "#EC006A",
  "#64748B",
  "#94A3B8",
];

const requests = requestData as ServiceRequest[];

/*
  The original service-request dataset does not contain member
  satisfaction or contact-channel fields.

  These two sections therefore use clearly labelled prototype
  data to demonstrate how the dashboard can support those
  future business requirements.
*/

const prototypeFeedbackData = requests.map((request, index) => {
  const ratings = [5, 4, 4, 5, 3, 4, 5, 4, 3, 5];

  return {
    ...request,
    feedback_rating: ratings[index % ratings.length],
  };
});

const prototypeChannelData = requests.map((request, index) => {
  const channels = ["Email", "Email", "Chatbot", "Phone", "Branch"];

  return {
    ...request,
    contact_channel: channels[index % channels.length],
  };
});

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [branchFilter, setBranchFilter] = useState("All");
  const [requestTypeFilter, setRequestTypeFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  const requestTypeOptions = useMemo(() => {
    const types = Array.from(
      new Set(requests.map((request) => request.request_type))
    );

    return ["All", ...types];
  }, []);

  const filteredRequests = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return requests.filter((request) => {
      const matchesStatus =
        statusFilter === "All" || request.status === statusFilter;

      const matchesBranch =
        branchFilter === "All" || request.branch === branchFilter;

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

  const totalPages = Math.max(
    1,
    Math.ceil(filteredRequests.length / PAGE_SIZE)
  );

  const safeCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

  const displayedRequests = filteredRequests.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

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

  const branchPerformance = useMemo(() => {
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

      const branchAverage =
        branchResolved.length > 0
          ? branchResolved.reduce(
              (sum, request) => sum + request.turnaround_days,
              0
            ) / branchResolved.length
          : 0;

      return {
        branch,
        requests: branchRequests.length,
        resolved: branchResolved.length,
        resolutionRate: Number(branchResolutionRate.toFixed(1)),
        averageTurnaround: Number(branchAverage.toFixed(1)),
      };
    });
  }, [filteredRequests]);

  const feedbackData = prototypeFeedbackData.filter((feedback) =>
    filteredRequests.some(
      (request) => request.request_id === feedback.request_id
    )
  );

  const averageSatisfaction =
    feedbackData.length > 0
      ? feedbackData.reduce(
          (sum, item) => sum + item.feedback_rating,
          0
        ) / feedbackData.length
      : 0;

  const positiveFeedback =
    feedbackData.length > 0
      ? (feedbackData.filter(
          (item) => item.feedback_rating >= 4
        ).length /
          feedbackData.length) *
        100
      : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating} Star`,
    responses: feedbackData.filter(
      (item) => item.feedback_rating === rating
    ).length,
  }));

  const channelData = ["Email", "Chatbot", "Phone", "Branch"].map(
    (channel) => ({
      name: channel,
      value: prototypeChannelData.filter(
        (item) =>
          item.contact_channel === channel &&
          filteredRequests.some(
            (request) => request.request_id === item.request_id
          )
      ).length,
    })
  );

  const topChannel =
    channelData.length > 0
      ? channelData.reduce((previous, current) =>
          current.value > previous.value ? current : previous
        )
      : null;

  const resetFilters = () => {
    setStatusFilter("All");
    setBranchFilter("All");
    setRequestTypeFilter("All");
    setPriorityFilter("All");
    setSearchTerm("");
    setCurrentPage(1);
  };

  const handleFilterChange = (
    setter: React.Dispatch<React.SetStateAction<string>>,
    value: string
  ) => {
    setter(value);
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
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
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
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className={darkMode ? "dashboard dark-mode" : "dashboard"}>
      <header className="top-header">
        <div className="header-inner">
          <div className="brand-area">
            <img
              src="/cpf-logo.png"
              alt="CPF Financial Services"
              className="cpf-logo"
            />

            <div className="brand-text">
              <div className="company-name">
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
            className="theme-button"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? "☀ Light Mode" : "☾ Dark Mode"}
          </button>
        </div>

        <nav className="main-nav">
          <a href="#dashboard">Dashboard</a>
          <a href="#feedback">Member Feedback</a>
          <a href="#reports">Reports</a>
          <a href="#ai-insights">AI Insights</a>
        </nav>
      </header>

      <div className="page-container">
        <section id="dashboard">
          <div className="section-heading">
            <div>
              <span className="section-label">OPERATIONS</span>
              <h2>Service Request Overview</h2>
            </div>

            <div className="prototype-status">
              Prototype Dashboard
            </div>
          </div>

          <div className="filter-panel">
            <div className="filter-heading">
              <div>
                <h3>Search & Filters</h3>
                <p>
                  Find and analyse service requests using the
                  available operational dimensions.
                </p>
              </div>

              <span>
                Showing {filteredRequests.length} of {requests.length}
              </span>
            </div>

            <div className="filter-grid">
              <div className="search-wrapper">
                <label>Search Requests</label>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Request ID, branch, request type..."
                />
              </div>

              <FilterSelect
                label="Status"
                value={statusFilter}
                options={STATUS_OPTIONS}
                onChange={(value) =>
                  handleFilterChange(setStatusFilter, value)
                }
              />

              <FilterSelect
                label="Branch"
                value={branchFilter}
                options={BRANCH_OPTIONS}
                onChange={(value) =>
                  handleFilterChange(setBranchFilter, value)
                }
              />

              <FilterSelect
                label="Request Type"
                value={requestTypeFilter}
                options={requestTypeOptions}
                onChange={(value) =>
                  handleFilterChange(setRequestTypeFilter, value)
                }
              />

              <FilterSelect
                label="Priority"
                value={priorityFilter}
                options={PRIORITY_OPTIONS}
                onChange={(value) =>
                  handleFilterChange(setPriorityFilter, value)
                }
              />

              <button
                className="reset-button"
                onClick={resetFilters}
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="kpi-grid">
            <KpiCard
              label="Total Requests"
              value={totalRequests}
              description="Current filtered workload"
              accent="blue"
            />

            <KpiCard
              label="Resolved"
              value={resolvedRequests.length}
              description={`${resolutionRate.toFixed(
                1
              )}% resolution rate`}
              accent="blue"
            />

            <KpiCard
              label="Pending"
              value={pendingRequests.length}
              description="Requests awaiting resolution"
              accent="pink"
            />

            <KpiCard
              label="Avg. Turnaround"
              value={`${averageTurnaround.toFixed(1)} days`}
              description="Resolved requests only"
              accent="dark"
            />
          </div>

          <div className="chart-grid">
            <section className="card">
              <div className="card-header">
                <div>
                  <h3>Request Status Distribution</h3>
                  <p>Current status across filtered requests.</p>
                </div>

                <strong>{totalRequests} Requests</strong>
              </div>

              <div className="chart-and-metrics">
                <div className="chart-container pie-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={48}
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

                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="metric-stack">
                  <MiniMetric
                    label="Resolved"
                    value={resolvedRequests.length}
                    accent="blue"
                  />

                  <MiniMetric
                    label="Pending"
                    value={pendingRequests.length}
                    accent="pink"
                  />

                  <MiniMetric
                    label="In Progress"
                    value={inProgressRequests.length}
                    accent="dark"
                  />
                </div>
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <div>
                  <h3>Branch Performance</h3>
                  <p>Resolution rate by branch.</p>
                </div>

                <strong>Resolution %</strong>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={branchPerformance}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="branch" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      formatter={(value) => [
                        `${value}%`,
                        "Resolution Rate",
                      ]}
                    />
                    <Bar
                      dataKey="resolutionRate"
                      fill="#42A4C1"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="branch-summary-table">
                {branchPerformance.map((branch) => (
                  <div
                    className="branch-summary-row"
                    key={branch.branch}
                  >
                    <span>{branch.branch}</span>
                    <span>{branch.requests} requests</span>
                    <strong>
                      {branch.resolutionRate.toFixed(1)}%
                    </strong>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>

        <section id="feedback" className="content-section">
          <div className="section-heading">
            <div>
              <span className="section-label">SERVICE QUALITY</span>
              <h2>Member Satisfaction</h2>
            </div>

            <div className="prototype-badge">
              PROTOTYPE DATA
            </div>
          </div>

          <div className="card notice-card">
            <p>
              The current dummy service-request dataset does not
              contain member feedback ratings. This section
              demonstrates the intended production dashboard
              structure using prototype data.
            </p>
          </div>

          <div className="feedback-grid">
            <div className="feedback-metrics">
              <MiniMetric
                label="Average Rating"
                value={`${averageSatisfaction.toFixed(1)} / 5`}
                accent="blue"
              />

              <MiniMetric
                label="Feedback Responses"
                value={feedbackData.length}
                accent="dark"
              />

              <MiniMetric
                label="Positive Feedback"
                value={`${positiveFeedback.toFixed(1)}%`}
                accent="pink"
              />
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Feedback Rating Distribution</h3>
                  <p>Prototype member satisfaction ratings.</p>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="responses"
                      fill="#EC006A"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="section-heading channel-heading">
            <div>
              <span className="section-label">
                MEMBER BEHAVIOUR
              </span>
              <h2>Member Contact Channels</h2>
            </div>

            <div className="prototype-badge">
              PROTOTYPE DATA
            </div>
          </div>

          <div className="card notice-card">
            <p>
              This prototype demonstrates how service requests
              could be analysed by contact channel. Production
              implementation would use approved member-service
              channel data.
            </p>
          </div>

          <div className="channel-grid">
            <div className="card">
              <div className="card-header">
                <div>
                  <h3>Contact Channel Distribution</h3>
                  <p>Email, chatbot, phone and branch interactions.</p>
                </div>
              </div>

              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                    >
                      {channelData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CHANNEL_COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="channel-metrics">
              {channelData.map((channel) => {
                const percentage =
                  filteredRequests.length > 0
                    ? (channel.value / filteredRequests.length) * 100
                    : 0;

                return (
                  <div
                    className="channel-card"
                    key={channel.name}
                  >
                    <span>{channel.name}</span>
                    <strong>{channel.value}</strong>
                    <small>{percentage.toFixed(1)}%</small>
                  </div>
                );
              })}

              {topChannel && (
                <div className="leading-channel">
                  <span>Leading Channel</span>
                  <strong>{topChannel.name}</strong>
                  <small>
                    {topChannel.value} requests in current view
                  </small>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="content-section">
          <div className="section-heading">
            <div>
              <span className="section-label">OPERATIONS</span>
              <h2>Service Request Details</h2>
            </div>
          </div>

          <div className="card table-card">
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
                  {displayedRequests.map((request) => (
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
                        <StatusBadge status={request.status} />
                      </td>

                      <td>
                        {request.status === "Resolved"
                          ? `${request.turnaround_days} days`
                          : "—"}
                      </td>
                    </tr>
                  ))}

                  {displayedRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="empty-state">
                        No service requests match the selected
                        filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>
                Showing{" "}
                {filteredRequests.length === 0
                  ? 0
                  : startIndex + 1}{" "}
                –{" "}
                {Math.min(
                  startIndex + PAGE_SIZE,
                  filteredRequests.length
                )}{" "}
                of {filteredRequests.length}
              </span>

              <div className="pagination-controls">
                <button
                  disabled={safeCurrentPage === 1}
                  onClick={() =>
                    setCurrentPage((page) => Math.max(1, page - 1))
                  }
                >
                  Previous
                </button>

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
                      className={
                        page === safeCurrentPage
                          ? "active-page"
                          : ""
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}

                <button
                  disabled={safeCurrentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(totalPages, page + 1)
                    )
                  }
                >
                  Next
                </button>
              </div>
            </div>

            <div className="table-note">
              The table displays 10 records per page to keep the
              operational view manageable. KPI calculations use
              the complete filtered dataset.
            </div>
          </div>
        </section>

        <section id="reports" className="content-section">
          <div className="section-heading">
            <div>
              <span className="section-label">REPORTING</span>
              <h2>Reports & Export</h2>
            </div>
          </div>

          <div className="report-grid">
            <div className="card report-card">
              <span className="report-label">CURRENT REPORT</span>
              <h3>Operational Service Request Report</h3>

              <p>
                Export the current filtered operational view for
                further analysis, reporting or management review.
              </p>

              <button
                className="primary-button"
                onClick={exportCSV}
              >
                Export Filtered Data CSV
              </button>
            </div>

            <div className="card summary-card">
              <span className="report-label">
                OPERATIONAL SUMMARY
              </span>

              <div className="summary-row">
                <span>Total Requests</span>
                <strong>{totalRequests}</strong>
              </div>

              <div className="summary-row">
                <span>Resolved</span>
                <strong>{resolvedRequests.length}</strong>
              </div>

              <div className="summary-row">
                <span>Pending</span>
                <strong>{pendingRequests.length}</strong>
              </div>

              <div className="summary-row">
                <span>Resolution Rate</span>
                <strong>{resolutionRate.toFixed(1)}%</strong>
              </div>

              <div className="summary-row">
                <span>Avg. Turnaround</span>
                <strong>
                  {averageTurnaround.toFixed(1)} days
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section id="ai-insights" className="content-section">
          <div className="section-heading">
            <div>
              <span className="section-label">
                FUTURE CAPABILITY
              </span>
              <h2>AI Insights</h2>
            </div>

            <div className="coming-badge">COMING NEXT</div>
          </div>

          <div className="ai-card">
            <div className="ai-header">
              <div>
                <span className="ai-label">AI INTEGRATION SPACE</span>
                <h3>Intelligent Service Operations</h3>
              </div>

              <span className="ai-status">PLANNED</span>
            </div>

            <p>
              This area is reserved for future AI capabilities.
              The current prototype does not present fabricated AI
              recommendations or analysis as real results.
            </p>

            <div className="ai-capabilities">
              <div className="ai-capability">
                <span>01</span>
                <h4>Theme Detection</h4>
                <p>
                  Identify recurring themes and patterns in member
                  service requests.
                </p>
              </div>

              <div className="ai-capability">
                <span>02</span>
                <h4>Feedback Summary</h4>
                <p>
                  Summarise member feedback and identify service
                  quality trends.
                </p>
              </div>

              <div className="ai-capability">
                <span>03</span>
                <h4>Workload Alerts</h4>
                <p>
                  Detect unusual request volumes and operational
                  workload patterns.
                </p>
              </div>

              <div className="ai-capability">
                <span>04</span>
                <h4>Management Attention</h4>
                <p>
                  Highlight areas that may require management
                  review or intervention.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="dashboard-footer">
        <div>
          <strong>CPF FINANCIAL SERVICES</strong>
          <span>Member Service Request Dashboard</span>
        </div>

        <p>
          Prototype dashboard using dummy CPF-style service
          request data. Satisfaction and contact-channel sections
          are prototype examples.
        </p>
      </footer>
    </main>
  );
}

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
        onChange={(event) => onChange(event.target.value)}
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
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string | number;
  description: string;
  accent: "blue" | "pink" | "dark";
}) {
  return (
    <div className={`kpi-card ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: "blue" | "pink" | "dark";
}) {
  return (
    <div className={`mini-metric ${accent}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`status-badge ${status.toLowerCase().replace(" ", "-")}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`priority-badge ${priority.toLowerCase()}`}
    >
      {priority}
    </span>
  );
}