type DashboardFiltersProps = {
  statusFilter: string;
  branchFilter: string;
  requestTypeFilter: string;
  priorityFilter: string;

  setStatusFilter: (value: string) => void;
  setBranchFilter: (value: string) => void;
  setRequestTypeFilter: (value: string) => void;
  setPriorityFilter: (value: string) => void;

  resetFilters: () => void;
  darkMode: boolean;
};

const statuses = [
  "All",
  "Resolved",
  "Pending",
  "In Progress",
];

const branches = [
  "All",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
];

const requestTypes = [
  "All",
  "Statement Request",
  "Contribution Inquiry",
  "Benefit Inquiry",
  "Profile Update",
  "Account Inquiry",
  "General Inquiry",
];

const priorities = [
  "All",
  "Normal",
  "High",
  "Urgent",
];

export default function DashboardFilters({
  statusFilter,
  branchFilter,
  requestTypeFilter,
  priorityFilter,
  setStatusFilter,
  setBranchFilter,
  setRequestTypeFilter,
  setPriorityFilter,
  resetFilters,
  darkMode,
}: DashboardFiltersProps) {
  const selectClass = `w-full rounded-lg border px-3 py-2 text-sm outline-none ${
    darkMode
      ? "border-slate-700 bg-slate-800 text-white"
      : "border-slate-300 bg-white text-slate-700"
  }`;

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ${
        darkMode
          ? "border-slate-800 bg-slate-900"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2
            className={`font-semibold ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            Filters
          </h2>

          <p
            className={`text-xs ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }`}
          >
            Filter the dashboard to focus on specific requests.
          </p>
        </div>

        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
          className={selectClass}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              Status: {status}
            </option>
          ))}
        </select>

        <select
          value={branchFilter}
          onChange={(event) =>
            setBranchFilter(event.target.value)
          }
          className={selectClass}
        >
          {branches.map((branch) => (
            <option key={branch} value={branch}>
              Branch: {branch}
            </option>
          ))}
        </select>

        <select
          value={requestTypeFilter}
          onChange={(event) =>
            setRequestTypeFilter(event.target.value)
          }
          className={selectClass}
        >
          {requestTypes.map((type) => (
            <option key={type} value={type}>
              Type: {type}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
          className={selectClass}
        >
          {priorities.map((priority) => (
            <option key={priority} value={priority}>
              Priority: {priority}
            </option>
          ))}
        </select>

      </div>
    </section>
  );
}