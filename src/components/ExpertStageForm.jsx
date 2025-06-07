import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://mg-vts-backend.onrender.com/api";

const ExpertStageForm = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [expertName, setExpertName] = useState("");
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get(`${API_BASE}/technicians`, {
          headers: getAuthHeader(),
        });
        setTechnicianOptions(res.data);
      } catch (error) {
        setTechnicianOptions([]);
      }
    };
    fetchTechnicians();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const finalExpertName = selectedOption === "Other" ? expertName : selectedOption;

    try {
      await axios.post(
        `${API_BASE}/vehicle-check`,
        {
          vehicleNumber,
          stage: "assignExpert",
          eventType: "Start",
          expertName: finalExpertName,
        },
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Expert assigned successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Error during expert assignment.");
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          font-family: Arial, sans-serif;
          background-color: #f0f2f5;
        }

        .expert-form-container {
          max-width: 450px;
          margin: 40px auto;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 0 12px rgba(0,0,0,0.1);
          background: #f9f9f9;
        }

        .expert-form-container h3 {
          text-align: center;
          margin-bottom: 24px;
          font-size: 24px;
          color: #333;
        }

        .expert-form-container form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .expert-form-container label {
          font-weight: 600;
          margin-bottom: 6px;
        }

        .expert-form-container input,
        .expert-form-container select {
          padding: 10px;
          font-size: 16px;
          border-radius: 6px;
          border: 1px solid #ccc;
          width: 100%;
          box-sizing: border-box;
        }

        .expert-form-container button {
          padding: 12px;
          font-size: 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.3s ease;
        }

        .expert-form-container button:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .expert-form-container button:hover:not(:disabled) {
          background-color: #0056b3;
        }

        .message {
          margin-top: 16px;
          text-align: center;
          font-weight: 500;
        }

        @media (max-width: 500px) {
          .expert-form-container {
            margin: 20px;
            padding: 16px;
          }

          .expert-form-container h3 {
            font-size: 20px;
          }

          .expert-form-container input,
          .expert-form-container select,
          .expert-form-container button {
            font-size: 15px;
          }
        }
      `}</style>

      <div className="expert-form-container">
        <h3>Expert Stage</h3>
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ color: "#007bff", fontWeight: "600" }}>Vehicle Number:</label>
            <input
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
  <label style={{ color: "#007bff", fontWeight: "600" }}>Expert Name:</label>
  <select
    value={selectedOption}
    onChange={(e) => setSelectedOption(e.target.value)}
    required
  >
    <option value="">Select Technician</option>
    {technicianOptions.map((tech) => (
      <option key={tech._id} value={tech.name}>
        {tech.name}
      </option>
    ))}
    <option value="Other">Other (Manual Entry)</option>
  </select>
</div>


          {selectedOption === "Other" && (
            <div>
              <label style={{ color: "#007bff", fontWeight: "600" }}>Enter Expert Name:</label>
              <input
                value={expertName}
                onChange={(e) => setExpertName(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
        {message && (
          <div
            className="message"
            style={{ color: message.includes("success") ? "green" : "red" }}
          >
            {message}
          </div>
        )}
      </div>
    </>
  );
};

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default ExpertStageForm;
