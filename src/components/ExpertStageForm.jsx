import React, { useState } from "react";
import axios from "axios";

const API_BASE = "https://mg-vts-backend.onrender.com/api";

const ExpertStageForm = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [expertName, setExpertName] = useState("");
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
          stage: "assignExpert",
          eventType: "Start",
          expertName,
        },
        { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
      );
      setMessage("Expert assigned successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error during expert assignment.");
    }
    setLoading(false);
  };

  return (
    <div>
      <h3>Expert Stage</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Vehicle Number:</label>
          <input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())} required />
        </div>
        <div>
          <label>Expert Name:</label>
          <input value={expertName} onChange={(e) => setExpertName(e.target.value)} required />
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

export default ExpertStageForm;
