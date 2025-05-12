import React, { useState, useEffect } from "react";
import axios from "axios";
import './BayAllocationForm.css';

const API_BASE = "https://mg-vts-backend.onrender.com/api";

const BayAllocationForm = () => {
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [searching, setSearching] = useState(false);
  const [concern, setConcern] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [frtHours, setFrtHours] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTechDropdown, setShowTechDropdown] = useState(false);

  // Fetch technicians on mount
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get(`${API_BASE}/technicians`, { headers: getAuthHeader() });
        setTechnicianOptions(res.data);
      } catch (error) {
        console.error("Error fetching technicians:", error);
        setTechnicianOptions([]);
      }
    };
    
    fetchTechnicians();
  }, []);

  // Search concern by vehicle number
  const handleSearch = async () => {
    if (!vehicleNumber.trim()) return;
    
    setSearching(true);
    setConcern("");
    setJobDescription("");
    setMessage("");
    
    try {
      const res = await axios.get(`${API_BASE}/jobcard-concerns/${vehicleNumber}`, { headers: getAuthHeader() });
      setConcern(res.data.concern);
      setJobDescription(res.data.concern);
      setMessage("");
    } catch (err) {
      setConcern("");
      setJobDescription("");
      setMessage(err.response?.data?.message || "No concern found for this vehicle.");
    }
    setSearching(false);
  };

  // Submit bay allocation
   // Submit bay allocation
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  
  try {
    await axios.post(
      `${API_BASE}/vehicle-check`,
      {
        vehicleNumber,
        stage: "bayAllocation",
        eventType: "Start", // Add this required field
        vehicleModel,
        serviceType,
        jobDescription,
        itemDescription,
        frtHours,
        technicians,
      },
      { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
    );
    
    setMessage("Bay allocation successfully completed.");
    
  } catch (err) {
    setMessage(err.response?.data?.message || "Error during bay allocation process.");
  }
  
  setLoading(false);
};
  
  const resetForm = () => {
    setVehicleNumber("");
    setConcern("");
    setJobDescription("");
    setVehicleModel("");
    setServiceType("");
    setItemDescription("");
    setFrtHours("");
    setTechnicians([]);
  };

  // Toggle technician in selection
  const toggleTechnician = (techId) => {
    setTechnicians(prev => {
      if (prev.includes(techId)) {
        return prev.filter(id => id !== techId);
      } else {
        return [...prev, techId];
      }
    });
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("tech-dropdown-container");
      if (dropdown && !dropdown.contains(event.target)) {
        setShowTechDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get technician name by ID
  const getTechnicianName = (techId) => {
    const tech = technicianOptions.find(t => t._id === techId);
    return tech ? tech.name : "";
  };

  const serviceTypeOptions = [
    "Scheduled Maintenance",
    "Repair Work",
    "Warranty Claim",
    "Recall Service",
    "Diagnostic Check"
  ];

  return (
    <div className="bay-allocation-container">
      <div className="bay-allocation-header">
        <h2>Vehicle Bay Allocation</h2>
        <p className="bay-header-subtitle">Service Management System</p>
      </div>
      
      <div className="bay-allocation-content">
        <form onSubmit={handleSubmit} className="bay-allocation-form">
          {/* Vehicle Number with Search - Top Row */}
          <div className="form-span-4">
            <div className="form-group">
              <label htmlFor="vehicleNumber">Vehicle Registration Number</label>
              <div className="search-field">
                <input
                  id="vehicleNumber"
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="Enter vehicle number"
                  required
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searching || !vehicleNumber}
                  className="search-button"
                >
                  {searching ? "Searching..." : "Retrieve"}
                </button>
              </div>
            </div>
          </div>
    
          {/* First Row - Vehicle Model and Service Type */}
          <div className="form-span-2">
            <div className="form-group">
              <label htmlFor="vehicleModel">Vehicle Model</label>
              <input 
                id="vehicleModel"
                type="text" 
                value={vehicleModel} 
                onChange={(e) => setVehicleModel(e.target.value)} 
                placeholder="Enter vehicle model"
                required 
              />
            </div>
          </div>
          
          <div className="form-span-2">
            <div className="form-group">
              <label htmlFor="serviceType">Service Type</label>
              <select
                id="serviceType"
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                required
                className="select-input"
              >
                <option value="">Select service type</option>
                {serviceTypeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Second Row - Customer Concern (if available) */}
          {concern && (
            <div className="form-span-4">
              <div className="form-group">
                <label htmlFor="concern">Customer Concern (from Job Card)</label>
                <textarea 
                  id="concern"
                  value={concern} 
                  readOnly 
                  className="readonly-field"
                />
              </div>
            </div>
          )}
          
          {/* Row - Job Description */}
          <div className="form-span-4">
            <div className="form-group">
              <label htmlFor="jobDescription">Job Description</label>
              <textarea 
                id="jobDescription"
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)} 
                placeholder="Enter detailed job description"
                required 
              />
            </div>
          </div>
          
          {/* Row - Item Description and FRT Hours */}
          <div className="form-span-3">
            <div className="form-group">
              <label htmlFor="itemDescription">Item Description</label>
              <input 
                id="itemDescription"
                type="text" 
                value={itemDescription} 
                onChange={(e) => setItemDescription(e.target.value)} 
                placeholder="Enter parts/items needed"
                required 
              />
            </div>
          </div>
          
          <div className="form-span-1">
            <div className="form-group">
              <label htmlFor="frtHours">FRT Hours</label>
              <input 
                id="frtHours"
                type="number" 
                min="0.1" 
                step="0.1" 
                value={frtHours} 
                onChange={(e) => setFrtHours(e.target.value)} 
                placeholder="Hours"
                required 
              />
            </div>
          </div>
          
          {/* Improved Technicians Selection */}
          <div className="form-span-4">
            <div className="form-group">
              <label htmlFor="technicians">Assign Technicians</label>
              <div id="tech-dropdown-container" className="custom-dropdown-container">
                <div 
                  className="selected-techs-display"
                  onClick={() => setShowTechDropdown(!showTechDropdown)}
                >
                  {technicians.length > 0 ? (
                    <div className="selected-techs-chips">
                      {technicians.map(techId => (
                        <div key={techId} className="tech-chip">
                          <span>{getTechnicianName(techId)}</span>
                          <span 
                            className="remove-tech" 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTechnician(techId);
                            }}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="placeholder-text">Select technicians</span>
                  )}
                  <span className="dropdown-arrow">{showTechDropdown ? '▲' : '▼'}</span>
                </div>
                
                {showTechDropdown && (
                  <div className="tech-dropdown-list">
                    {technicianOptions.length > 0 ? (
                      technicianOptions.map((tech) => (
                        <div 
                          key={tech._id} 
                          className={`tech-option ${technicians.includes(tech._id) ? 'selected' : ''}`}
                          onClick={() => toggleTechnician(tech._id)}
                        >
                          <input 
                            type="checkbox" 
                            checked={technicians.includes(tech._id)} 
                            onChange={() => {}} 
                            id={`tech-${tech._id}`}
                          />
                          <label htmlFor={`tech-${tech._id}`}>{tech.name}</label>
                        </div>
                      ))
                    ) : (
                      <div className="tech-option disabled">Loading technicians...</div>
                    )}
                  </div>
                )}
                <input 
                  type="hidden" 
                  name="technicians" 
                  value={technicians}
                  required={technicians.length === 0}
                />
              </div>
              <small className="tech-help">Click to open dropdown and select multiple technicians</small>
            </div>
          </div>
        </form>
        
        <div className="form-actions">
          <button 
            onClick={handleSubmit} 
            className="primary-button" 
            disabled={loading}
          >
            {loading ? "Processing..." : "Allocate Bay"}
          </button>
          <button 
            type="button" 
            className="secondary-button" 
            onClick={resetForm}
          >
            Clear Form
          </button>
        </div>
    
        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

// Utility to get JWT token from localStorage or secure storage
function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default BayAllocationForm;