import React, { useState } from "react";
import axios from "axios";
import BayAllocationForm from "./BayAllocationForm";
import ExpertStageForm from "./ExpertStageForm";
import JobCardReceivedForm from "./JobCardReceivedForm";
import './JobControllerDashboard.css';

const API_BASE = "https://mg-vts-backend.onrender.com/api";

// Map history types to state keys and endpoints
const HISTORY_MAP = {
  bayAllocation: {
    stateKey: "bayAllocations",
    endpoint: "/history/bay-allocations",
    label: "Bay Allocation History"
  },
  expertStage: {
    stateKey: "expertAssignments",
    endpoint: "/history/expert-assignments",
    label: "Expert Stage History"
  },
  jobCardReceived: {
    stateKey: "jobCardReceipts",
    endpoint: "/history/job-card-receipts",
    label: "Job Card Received History"
  }
};

const JobControllerDashboard = () => {
  const [selected, setSelected] = useState("");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyData, setHistoryData] = useState({
    bayAllocations: [],
    expertAssignments: [],
    jobCardReceipts: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState("");

  // Utility to get JWT token from localStorage
  function getAuthHeader() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Toggle for the expandable history section
  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
    if (!isHistoryOpen) {
      setSelectedHistory("");
    }
  };

  // Fetch history data when a history button is clicked
  const fetchHistory = async (type) => {
    setLoading(true);
    setSelectedHistory(type);

    const map = HISTORY_MAP[type];
    if (!map) return setLoading(false);

    try {
      const response = await axios.get(`${API_BASE}${map.endpoint}`, {
        headers: getAuthHeader()
      });

      // Defensive: always update the right state key
      setHistoryData(prev => ({
        ...prev,
        [map.stateKey]: response.data || []
      }));
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistoryData(prev => ({
        ...prev,
        [map.stateKey]: []
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Job Controller Dashboard</h1>
        <div className="header-nav">
          <div className="nav-item" onClick={() => setSelected("")}>Home</div>
          <div className="nav-item" onClick={toggleHistory}>
            History <span className={`arrow ${isHistoryOpen ? "open" : ""}`}>➔</span>
          </div>
        </div>
      </header>

      {/* Activity Buttons */}
      {selected === "" && (
        <div className="activity-section">
          <div className="button-container">
            <button onClick={() => setSelected("bayAllocation")} className="activity-button">Bay Allocation</button>
            <button onClick={() => setSelected("expertStage")} className="activity-button">Expert Stage</button>
            <button onClick={() => setSelected("jobCardReceived")} className="activity-button">Job Ending (Job Card Received)</button>
          </div>
        </div>
      )}

      {/* Display Forms based on selection */}
      <div className="form-section">
        {selected === "bayAllocation" && <BayAllocationForm />}
        {selected === "expertStage" && <ExpertStageForm />}
        {selected === "jobCardReceived" && <JobCardReceivedForm />}
      </div>

      {/* Expandable History Section */}
      {isHistoryOpen && (
        <div className="history-section">
          <div className="history-buttons">
            <button
              className={`history-button ${selectedHistory === "bayAllocation" ? "active" : ""}`}
              onClick={() => fetchHistory("bayAllocation")}
            >
              Bay Allocation History
            </button>
            <button
              className={`history-button ${selectedHistory === "expertStage" ? "active" : ""}`}
              onClick={() => fetchHistory("expertStage")}
            >
              Expert Stage History
            </button>
            <button
              className={`history-button ${selectedHistory === "jobCardReceived" ? "active" : ""}`}
              onClick={() => fetchHistory("jobCardReceived")}
            >
              Job Card Received History
            </button>
          </div>

          {loading && <div className="loading-message">Loading history...</div>}

          {/* Bay Allocation History */}
          {selectedHistory === "bayAllocation" && !loading && (
  <div className="history-table-container">
    <h3>Bay Allocation History</h3>
    {historyData.bayAllocations.length > 0 ? (
      <table className="history-table">
        <thead>
          <tr>
            <th>Vehicle Number</th>
            <th>Date/Time</th>
            <th>Performed By</th>
            <th>Vehicle Model</th>
            <th>Service Type</th>
            <th>Job Description</th>
            <th>Item Description</th>
            <th>FRT Hours</th>
            <th>Technicians</th>
            <th>First Allocation?</th>
          </tr>
        </thead>
        <tbody>
          {historyData.bayAllocations.map((allocation, index) => (
            <tr key={index}>
              <td>{allocation.vehicleNumber || 'N/A'}</td>
              <td>{allocation.startTime ? formatDate(allocation.startTime) : 'N/A'}</td>
              <td>{allocation.performedBy?.name || 'N/A'}</td>
              <td>{allocation.vehicleModel || 'N/A'}</td>
              <td>{allocation.serviceType || 'N/A'}</td>
              <td>{allocation.jobDescription || 'N/A'}</td>
              <td>{allocation.itemDescription || 'N/A'}</td>
              <td>{allocation.frtHours || 'N/A'}</td>
              <td>
                {Array.isArray(allocation.technicians) && allocation.technicians.length > 0
                  ? allocation.technicians.map(tech => tech?.name || tech).join(', ')
                  : 'None'}
              </td>
              <td>{allocation.isFirstAllocation ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <div className="no-history-message">No bay allocation history found.</div>
    )}
  </div>
)}


          {/* Expert Stage History */}
          {selectedHistory === "expertStage" && !loading && (
            <div className="history-table-container">
              <h3>Expert Stage History</h3>
              {historyData.expertAssignments.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Vehicle Number</th>
                      <th>Date/Time</th>
                      <th>Performed By</th>
                      <th>Expert Name</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.expertAssignments.map((assignment, index) => (
                      <tr key={index}>
                        <td>{assignment.vehicleNumber || 'N/A'}</td>
                        <td>{assignment.startTime ? formatDate(assignment.startTime) : 'N/A'}</td>
                        <td>
                          {assignment.performedBy
                            ? (typeof assignment.performedBy === 'object'
                              ? assignment.performedBy.name
                              : assignment.performedBy)
                            : 'N/A'}
                        </td>
                        <td>{assignment.expertName || 'N/A'}</td>
                        <td>{assignment.isCompleted ? 'Completed' : 'In Progress'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-history-message">
                  No expert stage history found.
                </div>
              )}
            </div>
          )}

          {/* Job Card Received History */}
          {selectedHistory === "jobCardReceived" && !loading && (
            <div className="history-table-container">
              <h3>Job Card Received History</h3>
              {historyData.jobCardReceipts.length > 0 ? (
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Vehicle Number</th>
                      <th>Date/Time</th>
                      <th>Performed By</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.jobCardReceipts.map((receipt, index) => (
                      <tr key={index}>
                        <td>{receipt.vehicleNumber || 'N/A'}</td>
                        <td>{receipt.startTime ? formatDate(receipt.startTime) : 'N/A'}</td>
                        <td>
                          {receipt.performedBy
                            ? (typeof receipt.performedBy === 'object'
                              ? receipt.performedBy.name
                              : receipt.performedBy)
                            : 'N/A'}
                        </td>
                        <td>{receipt.isCompleted ? 'Completed' : 'In Progress'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-history-message">
                  No job card received history found.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobControllerDashboard;
