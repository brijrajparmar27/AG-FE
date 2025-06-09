import { Status, StatusId } from "./types";

interface GridStatusBarProps {
  selectStatus: (statusId: StatusId | "ALL") => void;
  selectedStatus: StatusId | "ALL";
  statuses: Status[];
}

const GridStatusBar = ({
  selectStatus,
  selectedStatus,
  statuses,
}: GridStatusBarProps) => {
  return (
    <div className="status-container">
      <div
        className={`status-item ${selectedStatus === "ALL" ? "selected" : ""}`}
        onClick={() => selectStatus("ALL")}
      >
        <p className="status-count">
          {statuses.reduce((acc, status) => acc + status.count, 0)}
        </p>
        <p className="status-name">All</p>
      </div>
      {statuses.map((status) => (
        <div
          key={status.id}
          className={`status-item ${
            status.id === selectedStatus ? "selected" : ""
          }`}
          onClick={() => selectStatus(status.id)}
        >
          <p className="status-count">{status.count}</p>
          <p className="status-name">{status.name}</p>
        </div>
      ))}
    </div>
  );
};

export default GridStatusBar;
