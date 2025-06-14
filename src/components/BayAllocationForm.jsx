import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import './BayAllocationForm.css';
import MGVehicleModels from "./MGVehicleModel";
import {
  astorItemsWithFRT,
  cometItemsWithFRT,
  glosterItemsWithFRT,
  hectorItemswithFRT,
  windosrItemsWithFrt,
  ZSItemsWithFrt
} from './itemsWithFRT';

const API_BASE = "https://mg-vts-backend.onrender.com/api";

const serviceTypeOptions = [
  "PDI",
  "Pre PDI",
  "Preventive Maintenance-Paid Service(PMS)",
  "GR",
  "1st Free Service",
  "2nd Free Service",
  "3rd Free Service",
  "4th Free Service",
  "5th Free Service",
  "Refurbishment Service",
  "Re-RePair"
];

const BayAllocationForm = () => {
  // State
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [concern, setConcern] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [customVehicleModel, setCustomVehicleModel] = useState("");
  const [vehicleModelSearch, setVehicleModelSearch] = useState("");
  const [serviceTypes, setServiceTypes] = useState([]);
  const [itemDescription, setItemDescription] = useState("");
  const [itemDescriptionSearch, setItemDescriptionSearch] = useState("");
  const [customItemDescription, setCustomItemDescription] = useState("");
  const [frtHours, setFrtHours] = useState("");
  const [customFrtHours, setCustomFrtHours] = useState("");
  const [itemList, setItemList] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [technicianOptions, setTechnicianOptions] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTechDropdown, setShowTechDropdown] = useState(false);
  const [itemDescriptionOptions, setItemDescriptionOptions] = useState([]);
  const [showVehicleModelDropdown, setShowVehicleModelDropdown] = useState(false);
  const [showItemDescriptionDropdown, setShowItemDescriptionDropdown] = useState(false);
  const [showServiceTypeDropdown, setShowServiceTypeDropdown] = useState(false);

  const vehicleModelInputRef = useRef(null);
  const itemDescriptionInputRef = useRef(null);
  const serviceTypeInputRef = useRef(null);

  // Fetch technicians on mount
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get(`${API_BASE}/technicians`, { headers: getAuthHeader() });
        setTechnicianOptions(res.data);
      } catch (error) {
        setTechnicianOptions([]);
      }
    };
    fetchTechnicians();
  }, []);

  // Update item description options when vehicle model changes
  useEffect(() => {
    let selectedModel = vehicleModel;
    if (vehicleModel === "Other") selectedModel = customVehicleModel;
    if (!selectedModel) {
      setItemDescriptionOptions([]);
      setItemDescription("");
      setFrtHours("");
      return;
    }
    if (selectedModel.toLowerCase().includes("astor")) {
      setItemDescriptionOptions(astorItemsWithFRT);
    } else if (selectedModel.toLowerCase().includes("comet")) {
      setItemDescriptionOptions(cometItemsWithFRT);
    } else if (selectedModel.toLowerCase().includes("gloster")) {
      setItemDescriptionOptions(glosterItemsWithFRT);
    } else if (selectedModel.toLowerCase().includes("hector")) {
      setItemDescriptionOptions(hectorItemswithFRT);
    } else if (selectedModel.toLowerCase().includes("windsor")) {
      setItemDescriptionOptions(windosrItemsWithFrt);
    } else if (selectedModel.toLowerCase().includes("zs")) {
      setItemDescriptionOptions(ZSItemsWithFrt);
    } else {
      setItemDescriptionOptions([]);
    }
    setItemDescription("");
    setFrtHours("");
    setCustomItemDescription("");
    setCustomFrtHours("");
    setItemDescriptionSearch("");
  }, [vehicleModel, customVehicleModel]);

  // Handle vehicle model search/filter
  const filteredVehicleModels = MGVehicleModels.filter(model =>
    model.toLowerCase().includes(vehicleModelSearch.toLowerCase())
  );

  // Handle item description search/filter
  const filteredItemDescriptions = itemDescriptionOptions.filter(item =>
    item.description.toLowerCase().includes(itemDescriptionSearch.toLowerCase())
  );

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

  // Handle vehicle model selection
  const handleVehicleModelSelect = (model) => {
    setVehicleModel(model);
    setShowVehicleModelDropdown(false);
    setVehicleModelSearch("");
    setCustomVehicleModel("");
  };

  // Handle custom vehicle model
  const handleCustomVehicleModel = () => {
    setVehicleModel("Other");
    setShowVehicleModelDropdown(false);
    setCustomVehicleModel("");
  };

  // Toggle service type selection
  const toggleServiceType = (type) => {
    setServiceTypes(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Handle item description selection
  const handleItemDescriptionSelect = (desc) => {
    setItemDescription(desc);
    setShowItemDescriptionDropdown(false);
    setItemDescriptionSearch("");
    setCustomItemDescription("");
    // Set FRT if found
    const selectedItem = itemDescriptionOptions.find(item => item.description === desc);
    setFrtHours(selectedItem ? selectedItem.frt.toString() : "");
  };

  // Handle custom item description
  const handleCustomItemDescription = () => {
    setItemDescription("Other");
    setShowItemDescriptionDropdown(false);
    setCustomItemDescription("");
    setFrtHours("");
  };

  // Add item to the list
  const addItemToList = () => {
    if (!itemDescription && !customItemDescription) {
      setMessage("Please select or enter an item description");
      return;
    }
    if (!frtHours && !customFrtHours) {
      setMessage("Please enter FRT hours");
      return;
    }

    const finalItemDescription = itemDescription === "Other" ? customItemDescription : itemDescription;
    const finalFrtHours = itemDescription === "Other" ? customFrtHours : frtHours;

    setItemList(prev => [
      ...prev,
      {
        description: finalItemDescription,
        frtHours: finalFrtHours
      }
    ]);

    // Reset fields
    setItemDescription("");
    setCustomItemDescription("");
    setFrtHours("");
    setCustomFrtHours("");
    setMessage("");
  };

  // Remove item from list
  const removeItemFromList = (index) => {
    setItemList(prev => prev.filter((_, i) => i !== index));
  };

  // Submit bay allocation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    let finalVehicleModel = vehicleModel === "Other" ? customVehicleModel : vehicleModel;

    if (vehicleModel === "Other" && !customVehicleModel) {
      setMessage("Please enter the vehicle model name.");
      setLoading(false);
      return;
    }
    if (serviceTypes.length === 0) {
      setMessage("Please select at least one service type.");
      setLoading(false);
      return;
    }
    if (itemList.length === 0) {
      setMessage("Please add at least one item to the list.");
      setLoading(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/vehicle-check`,
        {
          vehicleNumber,
          stage: "bayAllocation",
          eventType: "Start",
          vehicleModel: finalVehicleModel,
          serviceTypes,
          jobDescription,
          items: itemList,
          technicians,
        },
        { headers: { ...getAuthHeader(), "Content-Type": "application/json" } }
      );
      setMessage("Bay allocation successfully completed.");
      resetForm();
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
    setCustomVehicleModel("");
    setServiceTypes([]);
    setItemDescription("");
    setCustomItemDescription("");
    setFrtHours("");
    setCustomFrtHours("");
    setItemList([]);
    setTechnicians([]);
    setItemDescriptionOptions([]);
    setVehicleModelSearch("");
    setItemDescriptionSearch("");
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
      if (
        vehicleModelInputRef.current &&
        !vehicleModelInputRef.current.contains(event.target)
      ) {
        setShowVehicleModelDropdown(false);
      }
      if (
        itemDescriptionInputRef.current &&
        !itemDescriptionInputRef.current.contains(event.target)
      ) {
        setShowItemDescriptionDropdown(false);
      }
      if (
        serviceTypeInputRef.current &&
        !serviceTypeInputRef.current.contains(event.target)
      ) {
        setShowServiceTypeDropdown(false);
      }
      const techDropdown = document.getElementById("tech-dropdown-container");
      if (techDropdown && !techDropdown.contains(event.target)) {
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

  return (
    <div className="bay-allocation-container">
      <div className="bay-allocation-header">
        <h2>Vehicle Bay Allocation</h2>
        <p className="bay-header-subtitle">Service Management System</p>
      </div>

      <div className="bay-allocation-content">
        <form onSubmit={handleSubmit} className="bay-allocation-form" autoComplete="off">
          {/* Vehicle Number with Search */}
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

          {/* Vehicle Model with Searchable Dropdown & Custom Option */}
          <div className="form-span-2">
            <div className="form-group" ref={vehicleModelInputRef}>
              <label htmlFor="vehicleModel">Vehicle Model</label>
              <div className="custom-dropdown-container">
                <div
                  className="selected-techs-display"
                  onClick={() => setShowVehicleModelDropdown(!showVehicleModelDropdown)}
                  tabIndex={0}
                >
                  <span>
                    {vehicleModel === "Other"
                      ? customVehicleModel || <span className="placeholder-text">Other (Enter model name)</span>
                      : vehicleModel || <span className="placeholder-text">Select or search model</span>
                    }
                  </span>
                  <span className="dropdown-arrow">{showVehicleModelDropdown ? '▲' : '▼'}</span>
                </div>
                {showVehicleModelDropdown && (
                  <div className="tech-dropdown-list" style={{ maxHeight: 220 }}>
                    <input
                      type="text"
                      autoFocus
                      value={vehicleModelSearch}
                      onChange={e => setVehicleModelSearch(e.target.value)}
                      placeholder="Search model..."
                      style={{ width: "95%", margin: "7px auto", display: "block", padding: 6, borderRadius: 5, border: "1px solid #ddd" }}
                    />
                    {filteredVehicleModels.length > 0 ? (
                      filteredVehicleModels.map(model => (
                        <div
                          key={model}
                          className={`tech-option${vehicleModel === model ? " selected" : ""}`}
                          onClick={() => handleVehicleModelSelect(model)}
                        >
                          {model}
                        </div>
                      ))
                    ) : (
                      <div className="tech-option disabled">No model found</div>
                    )}
                    <div
                      className={`tech-option${vehicleModel === "Other" ? " selected" : ""}`}
                      style={{ color: "#2563eb", fontWeight: 600 }}
                      onClick={handleCustomVehicleModel}
                    >
                      + Other (Add New Model)
                    </div>
                  </div>
                )}
                {vehicleModel === "Other" && (
                  <input
                    type="text"
                    value={customVehicleModel}
                    onChange={e => setCustomVehicleModel(e.target.value)}
                    placeholder="Enter model name"
                    style={{ marginTop: 7 }}
                    required
                  />
                )}
              </div>
            </div>
          </div>

          {/* Service Type - Multi-select */}
          <div className="form-span-2">
            <div className="form-group" ref={serviceTypeInputRef}>
              <label htmlFor="serviceType">Service Type</label>
              <div className="custom-dropdown-container">
                <div
                  className="selected-techs-display"
                  onClick={() => setShowServiceTypeDropdown(!showServiceTypeDropdown)}
                  tabIndex={0}
                >
                  {serviceTypes.length > 0 ? (
                    <div className="selected-techs-chips">
                      {serviceTypes.map(type => (
                        <div key={type} className="tech-chip">
                          <span>{type}</span>
                          <span
                            className="remove-tech"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleServiceType(type);
                            }}
                          >
                            ×
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="placeholder-text">Select service types</span>
                  )}
                  <span className="dropdown-arrow">{showServiceTypeDropdown ? '▲' : '▼'}</span>
                </div>
                {showServiceTypeDropdown && (
                  <div className="tech-dropdown-list">
                    {serviceTypeOptions.map((type) => (
                      <div
                        key={type}
                        className={`tech-option ${serviceTypes.includes(type) ? 'selected' : ''}`}
                        onClick={() => toggleServiceType(type)}
                      >
                        <input
                          type="checkbox"
                          checked={serviceTypes.includes(type)}
                          onChange={() => {}}
                          id={`service-${type}`}
                        />
                        <label htmlFor={`service-${type}`}>{type}</label>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="hidden"
                  name="serviceTypes"
                  value={serviceTypes}
                  required={serviceTypes.length === 0}
                />
              </div>
              <small className="tech-help">Click to select multiple service types</small>
            </div>
          </div>

          {/* Customer Concern */}
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

          {/* Job Description */}
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

          {/* Item Description Section */}
          <div className="form-span-4">
            <div className="form-group">
              <label>Add Items</label>
              
              {/* Item Description Input */}
              <div className="form-group" ref={itemDescriptionInputRef}>
                <label htmlFor="itemDescription">Item Description</label>
                {itemDescriptionOptions.length > 0 ? (
                  <div className="custom-dropdown-container">
                    <div
                      className="selected-techs-display"
                      onClick={() => setShowItemDescriptionDropdown(!showItemDescriptionDropdown)}
                      tabIndex={0}
                    >
                      <span>
                        {itemDescription === "Other"
                          ? customItemDescription || <span className="placeholder-text">Other (Enter item)</span>
                          : itemDescription || <span className="placeholder-text">Select or search item</span>
                        }
                      </span>
                      <span className="dropdown-arrow">{showItemDescriptionDropdown ? '▲' : '▼'}</span>
                    </div>
                    {showItemDescriptionDropdown && (
                      <div className="tech-dropdown-list" style={{ maxHeight: 220 }}>
                        <input
                          type="text"
                          autoFocus
                          value={itemDescriptionSearch}
                          onChange={e => setItemDescriptionSearch(e.target.value)}
                          placeholder="Search item..."
                          style={{ width: "95%", margin: "7px auto", display: "block", padding: 6, borderRadius: 5, border: "1px solid #ddd" }}
                        />
                        {filteredItemDescriptions.length > 0 ? (
                          filteredItemDescriptions.map(item => (
                            <div
                              key={item.description}
                              className={`tech-option${itemDescription === item.description ? " selected" : ""}`}
                              onClick={() => handleItemDescriptionSelect(item.description)}
                            >
                              {item.description}
                            </div>
                          ))
                        ) : (
                          <div className="tech-option disabled">No item found</div>
                        )}
                        <div
                          className={`tech-option${itemDescription === "Other" ? " selected" : ""}`}
                          style={{ color: "#2563eb", fontWeight: 600 }}
                          onClick={handleCustomItemDescription}
                        >
                          + Other (Add New Item)
                        </div>
                      </div>
                    )}
                    {itemDescription === "Other" && (
                      <input
                        type="text"
                        value={customItemDescription}
                        onChange={e => setCustomItemDescription(e.target.value)}
                        placeholder="Enter item description"
                        style={{ marginTop: 7 }}
                      />
                    )}
                  </div>
                ) : (
                  <input
                    id="itemDescription"
                    type="text"
                    value={itemDescription === "Other" ? customItemDescription : itemDescription}
                    onChange={(e) => {
                      if (itemDescription === "Other") {
                        setCustomItemDescription(e.target.value);
                      } else {
                        setItemDescription(e.target.value);
                      }
                    }}
                    placeholder="Enter item description"
                  />
                )}
              </div>

              {/* FRT Hours Input */}
              <div className="form-group">
                <label htmlFor="frtHours">FRT Hours</label>
                <input
                  id="frtHours"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={itemDescription === "Other" ? customFrtHours : frtHours}
                  onChange={(e) => {
                    if (itemDescription === "Other") {
                      setCustomFrtHours(e.target.value);
                    } else {
                      setFrtHours(e.target.value);
                    }
                  }}
                  placeholder="Enter FRT hours"
                />
              </div>

              {/* Add Item Button */}
              <div className="form-group">
                <button
                  type="button"
                  onClick={addItemToList}
                  className="add-item-button"
                >
                  Add Item to List
                </button>
              </div>

              {/* Items List */}
              {itemList.length > 0 && (
                <div className="items-list-container">
                  <h4>Selected Items:</h4>
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>Item Description</th>
                        <th>FRT Hours</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemList.map((item, index) => (
                        <tr key={index}>
                          <td>{item.description}</td>
                          <td>{item.frtHours}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeItemFromList(index)}
                              className="remove-item-button"
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Technicians Selection */}
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
                            onChange={() => { }}
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

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="submit"
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
        </form>
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