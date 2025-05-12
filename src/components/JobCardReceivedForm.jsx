import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://mg-vts-backend.onrender.com/api";

const JobCardReceivedForm = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post(
        `${API_BASE}/vehicle-check`,
        {
          vehicleNumber,
          stage: "jobCardReceived",
          eventType: "Start"
        },
        { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
      );
      setMessage("Job Card marked as received!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error during job card received.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Job Card Received</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vehicle Number:</label>
          <input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} required />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit"}</button>
      </form>
      {message && <div style={{ marginTop: 12, color: message.includes("success") ? "green" : "red" }}>{message}</div>}
    </div>
  );
};

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default JobCardReceivedForm;
