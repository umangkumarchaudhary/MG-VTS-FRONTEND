import React, { useState, useEffect } from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import { QrReader } from "react-qr-reader";
import "./TechnicianDashboard.css";

const API_URL = "https://mg-vts-backend.onrender.com/api/vehicle-check";
const WIP_URL = "https://mg-vts-backend.onrender.com/api/work-in-progress";



const TechnicianDashboard = (props) => {
  const token = props.token || localStorage.getItem("token");

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [selectedStage, setSelectedStage] = useState("bayWork");
  const [eventType, setEventType] = useState("Start");
  const [workType, setWorkType] = useState("");
  const [bayNumber, setBayNumber] = useState("");
  const [additionalWork, setAdditionalWork] = useState("");
  const [workInProgress, setWorkInProgress] = useState([]);
  const [showWorkInProgress, setShowWorkInProgress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdditionalWorkDialog, setShowAdditionalWorkDialog] = useState(false);
  const [additionalWorkVehicle, setAdditionalWorkVehicle] = useState("");
  const [showQr, setShowQr] = useState(false);
  const navigate = useNavigate();

  // For viewing additional work logs
  const [showViewWorkModal, setShowViewWorkModal] = useState(false);
  const [viewWorkLogs, setViewWorkLogs] = useState([]);
  const [viewWorkVehicle, setViewWorkVehicle] = useState("");

  useEffect(() => {
    fetchWorkInProgress();
    // eslint-disable-next-line
  }, []);

  const fetchWorkInProgress = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(WIP_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkInProgress(res.data);
    } catch (e) {
      alert("Failed to fetch work in progress");
    }
    setIsLoading(false);
  };

  const handleScan = (data) => {
    if (data) {
      setVehicleNumber(data.toUpperCase());
      setShowQr(false);
    }
  };

  // FIX: Only require workType/bayNumber for Start, not for AdditionalWorkNeeded (even when called from modal)
  const handleSubmit = async (e, overrideVehicleNumber, overrideEventType) => {
    e && e.preventDefault();
    if (isLoading) return;

    // Use overrideVehicleNumber and overrideEventType if provided (for additional work), else use state
    const vNum = overrideVehicleNumber || vehicleNumber;
    const evtType = overrideEventType || eventType;

    if (!vNum || !vNum.trim()) {
      alert("Please scan or enter a vehicle number");
      return;
    }

    // Only require workType and bayNumber for "Start" event
    if (
      selectedStage === "bayWork" &&
      evtType === "Start" &&
      (!workType.trim() || !bayNumber.trim())
    ) {
      alert("Please enter both work type and bay number");
      return;
    }

    // Only require additionalWork for AdditionalWorkNeeded event
    if (
      selectedStage === "bayWork" &&
      evtType === "AdditionalWorkNeeded" &&
      !additionalWork.trim()
    ) {
      alert("Please describe the additional work needed");
      return;
    }

    setIsLoading(true);
    try {
      const body = {
        vehicleNumber: vNum.trim(),
        stage: selectedStage,
        eventType: evtType,
        role: "Technician"
      };
      if (selectedStage === "bayWork") {
        if (evtType === "AdditionalWorkNeeded") {
          body.additionalData = { commentText: additionalWork.trim() };
        } else if (evtType === "Start") {
          body.workType = workType.trim();
          body.bayNumber = bayNumber.trim();
        }
      }
      await axios.post(API_URL, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      alert("Status submitted successfully");
      setVehicleNumber("");
      setWorkType("");
      setBayNumber("");
      setAdditionalWork("");
      setEventType("Start");
      fetchWorkInProgress();
    } catch (e) {
      alert("Submission failed: " + (e.response?.data?.error || e.message));
    }
    setIsLoading(false);
  };

  const openAdditionalWorkDialog = (vehicleNum) => {
    setAdditionalWorkVehicle(vehicleNum);
    setShowAdditionalWorkDialog(true);
    setAdditionalWork("");
  };

  // FIX: Pass overrideEventType so validation is correct
  const submitAdditionalWork = async () => {
    setShowAdditionalWorkDialog(false);
    await handleSubmit(null, additionalWorkVehicle, "AdditionalWorkNeeded");
  };

  const openViewWorkModal = (vehicleNum, logs) => {
    setViewWorkVehicle(vehicleNum);
    setViewWorkLogs(logs || []);
    setShowViewWorkModal(true);
  };

  const handleLogout = () => {
  if (window.confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (props.onLogout) props.onLogout();
    navigate("/login"); // or your login route
  }
};

  return (
    <div className="tech-dashboard-container">
      <header className="tech-dashboard-header">
        <h2>Technician Dashboard</h2>
        <div>
          <button onClick={fetchWorkInProgress} title="Refresh">🔄</button>
          <button onClick={() => setShowWorkInProgress(w => !w)} title="Work in Progress">📋</button>
          <button onClick={handleLogout} title="Logout">🚪</button>
        </div>
      </header>
      <hr />
      {showWorkInProgress && (
        <div className="work-in-progress-section">
          <h4>Work In Progress</h4>
          {isLoading ? <div>Loading...</div> : workInProgress.length === 0 ? (
            <div>No vehicles currently in progress</div>
          ) : (
            <div className="wip-table-container">
              <table className="security-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Bay</th>
                    <th>Work Type</th>
                    <th>Started At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workInProgress.map((vehicle, idx) => (
                    <tr key={idx}>
                      <td>{vehicle.vehicleNumber || ""}</td>
                      <td>{vehicle.bayNumber || ""}</td>
                      <td>{vehicle.workType || ""}</td>
                      <td>{vehicle.startTimeIST || ""}</td>
                      <td>
                        <span className={vehicle.status === "Additional work needed" ? "status-additional" : "status-normal"}>
                          {vehicle.status || ""}
                        </span>
                      </td>
                      <td>
                        <button
                          className="report-btn"
                          onClick={() => openAdditionalWorkDialog(vehicle.vehicleNumber)}
                          title="Report Additional Work"
                        >
                          Report
                        </button>
                        {vehicle.additionalWorkLogs && vehicle.additionalWorkLogs.length > 0 && (
                          <button
                            style={{ marginLeft: 8, background: "#e3f2fd", border: "1px solid #1976d2", color: "#1976d2" }}
                            onClick={() => openViewWorkModal(vehicle.vehicleNumber, vehicle.additionalWorkLogs)}
                            title="View Additional Work"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <hr />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="vehicle-input-row">
          <input
            type="text"
            placeholder="Vehicle Number"
            value={vehicleNumber}
            onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
            className="vehicle-input"
            readOnly={showQr}
          />
          <button type="button" onClick={() => setShowQr(true)}>SCAN QR</button>
        </div>
        {showQr && (
          <div className="qr-reader-container">
            <QrReader
              constraints={{ facingMode: "environment" }}
              onResult={(result, error) => {
                if (!!result) {
                  handleScan(result.getText());
                }
              }}
              style={{ width: "100%" }}
            />
            <button type="button" className="close-qr-btn" onClick={() => setShowQr(false)}>Close Scanner</button>
          </div>
        )}

        <div>
          <label className="section-label">SELECT STAGE:</label>
          <div className="toggle-btn-row">
            <button
              type="button"
              className={selectedStage === "bayWork" ? "toggle-active" : ""}
              onClick={() => setSelectedStage("bayWork")}
            >
              Bay Work
            </button>
            <button
              type="button"
              className={selectedStage === "expertStage" ? "toggle-active" : ""}
              onClick={() => setSelectedStage("expertStage")}
            >
              Expert
            </button>
          </div>
        </div>

        <div>
          <label className="section-label">EVENT TYPE:</label>
          <div className="toggle-btn-row">
            {["Start", "Pause", "Resume", "End"].map(type => (
              <button
                type="button"
                key={type}
                className={eventType === type ? "toggle-active" : ""}
                onClick={() => setEventType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {selectedStage === "bayWork" && eventType === "Start" && (
          <>
            <input
              type="text"
              placeholder="Work Type"
              value={workType}
              onChange={e => setWorkType(e.target.value)}
              className="input-full"
            />
            <input
              type="text"
              placeholder="Bay Number"
              value={bayNumber}
              onChange={e => setBayNumber(e.target.value)}
              className="input-full"
            />
          </>
        )}

        {selectedStage === "expertStage" && (
          <div className="info-text">No additional input required</div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="submit-btn"
        >
          {isLoading ? "Submitting..." : "SUBMIT"}
        </button>
      </form>

      {/* Additional Work Dialog */}
      {showAdditionalWorkDialog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Report Additional Work</h3>
            <textarea
              rows={3}
              placeholder="Describe the additional work needed"
              value={additionalWork}
              onChange={e => setAdditionalWork(e.target.value)}
              className="input-full"
            />
            <div className="modal-btn-row">
              <button onClick={() => setShowAdditionalWorkDialog(false)}>Cancel</button>
              <button onClick={submitAdditionalWork} className="modal-submit-btn">Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* View Additional Work Modal */}
      {showViewWorkModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Additional Work for {viewWorkVehicle}</h3>
            {viewWorkLogs.length === 0 ? (
              <div>No additional work submitted.</div>
            ) : (
              <ul style={{ paddingLeft: 20 }}>
                {viewWorkLogs.map((log, idx) => (
                  <li key={idx} style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: "bold" }}>
                      {log.addedAt
                        ? new Date(log.addedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
                        : ""}
                    </span>
                    <br />
                    <span>{log.description}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-btn-row">
              <button onClick={() => setShowViewWorkModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianDashboard;
