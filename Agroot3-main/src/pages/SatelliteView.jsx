import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon for Vite/webpack builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_FIELDS = [
  {
    id: 1,
    cropName: "Rice Paddy",
    cropIcon: "🌾",
    yieldProgress: "78.2%",
    moisture: "82%",
    countLabel: "Hectares",
    countVal: "12",
    temp: "28°C",
    nextIrrigation: "Today • 18:00",
    lat: 10.7870,
    lon: 79.1378,
    state: "Tamil Nadu",
    city: "Thanjavur",
    soilType: "Clayey Alluvial",
    ph: 6.2,
    organic: "High",
    organicPct: "2.9",
    healthScore: 84
  },
  {
    id: 2,
    cropName: "Apple Orchard",
    cropIcon: "🍏",
    yieldProgress: "51.4%",
    moisture: "64%",
    countLabel: "Trees",
    countVal: "8,900",
    temp: "20°C",
    nextIrrigation: "Today • 01:30",
    lat: 34.0837,
    lon: 74.7973,
    state: "Jammu and Kashmir",
    city: "Srinagar",
    soilType: "Loamy Hilly",
    ph: 6.5,
    organic: "Very High",
    organicPct: "3.8",
    healthScore: 88
  },
  {
    id: 3,
    cropName: "Vineyard",
    cropIcon: "🍇",
    yieldProgress: "65.8%",
    moisture: "45%",
    countLabel: "Vines",
    countVal: "4,500",
    temp: "30°C",
    nextIrrigation: "Tomorrow • 08:00",
    lat: 19.9975,
    lon: 73.7898,
    state: "Maharashtra",
    city: "Nashik",
    soilType: "Black Regur",
    ph: 7.2,
    organic: "Medium",
    organicPct: "2.1",
    healthScore: 76
  },
  {
    id: 4,
    cropName: "Maize Crop",
    cropIcon: "🌽",
    yieldProgress: "42.1%",
    moisture: "58%",
    countLabel: "Rows",
    countVal: "320",
    temp: "29°C",
    nextIrrigation: "Today • 21:00",
    lat: 14.4644,
    lon: 75.9218,
    state: "Karnataka",
    city: "Davangere",
    soilType: "Red Sandy",
    ph: 6.8,
    organic: "Medium",
    organicPct: "1.9",
    healthScore: 70
  },
  {
    id: 5,
    cropName: "Citrus Grove",
    cropIcon: "🍊",
    yieldProgress: "89.5%",
    moisture: "70%",
    countLabel: "Trees",
    countVal: "6,200",
    temp: "27°C",
    nextIrrigation: "Tomorrow • 06:30",
    lat: 21.1458,
    lon: 79.0882,
    state: "Maharashtra",
    city: "Nagpur",
    soilType: "Regur Soil",
    ph: 7.5,
    organic: "High",
    organicPct: "2.5",
    healthScore: 80
  }
];

const RecenterMap = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => { map.setView([lat, lon], 14); }, [lat, lon, map]);
    return null;
};

const renderSidebarIcon = (label, isActive) => {
  switch (label) {
    case "Dashboard":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "Fields":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2.5" />
          <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
        </svg>
      );
    case "Crops":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.5.3.2.7.2 1-.1L19.7 8.2c.3-.3.3-.7.1-1C17.6 3.8 14.5 2 12 2z" />
          <path d="M12 2v20M2 12h20" strokeDasharray="1.5 1.5" />
        </svg>
      );
    case "Analytics":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "Irrigation":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-4.3-7-13-7-13S5 10.7 5 15a7 7 0 0 0 7 7z" />
        </svg>
      );
    case "Alerts":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "Reports":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "Settings":
      return (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
};

const SatelliteView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const [fieldsList, setFieldsList] = useState(() => {
    const saved = localStorage.getItem("agroot_fields_list");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_FIELDS;
  });

  const [selectedFieldId, setSelectedFieldId] = useState(() => {
    return location.state?.selectedFieldId || (fieldsList[0]?.id || 1);
  });
  const [mapType, setMapType] = useState("satellite");
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [usingGPS, setUsingGPS] = useState(false);
  const [gpsLocationData, setGpsLocationData] = useState({
    city: "Detecting...",
    state: "",
    soilType: "Alluvial",
    ph: 7.0,
    organic: "Medium",
    organicPct: "2.2",
    healthScore: 78,
    temp: "—",
    humidity: "—",
    windSpeed: "—",
    weatherDesc: "Stable Climate"
  });

  const [fieldNames, setFieldNames] = useState(() => {
    const saved = localStorage.getItem("agroot_field_names");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {
      1: "Rice Paddy",
      2: "Apple Orchard",
      3: "Vineyard",
      4: "Maize Crop",
      5: "Citrus Grove"
    };
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

  // Add Field states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newCropName, setNewCropName] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  const handleSaveFieldName = () => {
    if (!tempName.trim()) return;
    const updated = {
      ...fieldNames,
      [selectedFieldId]: tempName.trim()
    };
    setFieldNames(updated);
    localStorage.setItem("agroot_field_names", JSON.stringify(updated));
    setIsEditingName(false);
  };

  const handleDeleteField = (id, e) => {
    e.stopPropagation();
    const fieldToDelete = fieldsList.find(f => f.id === id);
    const fieldName = fieldNames[id] || fieldToDelete?.cropName || `Field ${id}`;
    if (window.confirm(`Are you sure you want to delete "${fieldName}"?`)) {
      const updatedList = fieldsList.filter(f => f.id !== id);
      setFieldsList(updatedList);
      localStorage.setItem("agroot_fields_list", JSON.stringify(updatedList));
      
      // If we deleted the active field, select the first remaining one
      if (selectedFieldId === id) {
        if (updatedList.length > 0) {
          setSelectedFieldId(updatedList[0].id);
        } else {
          setSelectedFieldId(1);
        }
      }
    }
  };

  const handleAddField = async (e) => {
    e.preventDefault();
    if (!newFieldName.trim() || !newCropName.trim() || !newLocation.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setGeocodingLoading(true);
    let lat = 20.5937; // default India coordinates
    let lon = 78.9629;
    let city = newLocation.trim();
    let state = "";

    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newLocation.trim())}&format=json&limit=1`;
      const res = await fetch(searchUrl, { signal: AbortSignal.timeout(4000) });
      const data = await res.json();
      if (data && data.length > 0) {
        lat = parseFloat(data[0].lat);
        lon = parseFloat(data[0].lon);
        
        // Let's try reverse geocoding to split city & state properly
        try {
          const revRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, { signal: AbortSignal.timeout(3000) });
          const revData = await revRes.json();
          if (revData && revData.address) {
            state = revData.address.state || "";
            city = revData.address.city || revData.address.town || revData.address.village || city;
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e);
        }
      } else {
        alert("Could not locate that address precisely. Saving with default map coordinates.");
      }
    } catch (err) {
      console.error("Geocoding failed:", err);
      alert("Network error: Could not geocode address. Saving with default map coordinates.");
    }

    // Parse state to match soil parameters
    let soilType = "Alluvial";
    let ph = 7.0;
    let organic = "Medium";
    let organicPct = "2.0";
    let healthScore = 75;

    const SOIL_DB_MOCK = {
      "Tamil Nadu": { type: "Red Laterite", ph: 6.4, organic: "Medium", organicPct: "2.1", healthScore: 72 },
      "Kerala": { type: "Laterite", ph: 5.2, organic: "High", organicPct: "3.4", healthScore: 78 },
      "Karnataka": { type: "Red & Black", ph: 7.0, organic: "Medium", organicPct: "2.5", healthScore: 74 },
      "Andhra Pradesh": { type: "Black Cotton", ph: 8.0, organic: "Low", organicPct: "1.2", healthScore: 60 },
      "Telangana": { type: "Red Sandy", ph: 6.5, organic: "Low", organicPct: "1.5", healthScore: 55 },
      "Maharashtra": { type: "Regur (Black)", ph: 7.5, organic: "Medium", organicPct: "2.2", healthScore: 70 },
      "Gujarat": { type: "Alluvial", ph: 7.8, organic: "Medium", organicPct: "2.4", healthScore: 76 },
      "Rajasthan": { type: "Desert Sandy", ph: 8.2, organic: "Low", organicPct: "0.9", healthScore: 48 },
      "Uttar Pradesh": { type: "Alluvial", ph: 7.0, organic: "High", organicPct: "2.9", healthScore: 88 },
      "Punjab": { type: "Alluvial", ph: 7.5, organic: "High", organicPct: "3.1", healthScore: 90 },
      "Haryana": { type: "Alluvial", ph: 7.8, organic: "Medium", organicPct: "2.6", healthScore: 80 },
      "West Bengal": { type: "Alluvial", ph: 6.0, organic: "High", organicPct: "3.0", healthScore: 86 },
      "Bihar": { type: "Alluvial", ph: 7.0, organic: "Medium", organicPct: "2.3", healthScore: 78 },
    };

    if (state) {
      const match = Object.keys(SOIL_DB_MOCK).find(k => 
        state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
      );
      if (match) {
        soilType = SOIL_DB_MOCK[match].type;
        ph = SOIL_DB_MOCK[match].ph;
        organic = SOIL_DB_MOCK[match].organic;
        organicPct = SOIL_DB_MOCK[match].organicPct;
        healthScore = SOIL_DB_MOCK[match].healthScore;
      }
    }

    const getCropEmoji = (name) => {
      const lower = name.toLowerCase();
      if (lower.includes("rice") || lower.includes("paddy")) return "🌾";
      if (lower.includes("apple")) return "🍏";
      if (lower.includes("grape") || lower.includes("vine")) return "🍇";
      if (lower.includes("maize") || lower.includes("corn")) return "🌽";
      if (lower.includes("orange") || lower.includes("citrus") || lower.includes("lemon")) return "🍊";
      if (lower.includes("wheat")) return "🌾";
      if (lower.includes("cotton")) return "☁️";
      if (lower.includes("tomato")) return "🍅";
      if (lower.includes("potato")) return "🥔";
      return "🌱";
    };

    const newId = fieldsList.length > 0 ? Math.max(...fieldsList.map(f => f.id)) + 1 : 1;
    const newFieldObj = {
      id: newId,
      cropName: newCropName.trim(),
      cropIcon: getCropEmoji(newCropName),
      yieldProgress: `${Math.floor(Math.random() * 40) + 50}%`,
      moisture: `${Math.floor(Math.random() * 30) + 50}%`,
      countLabel: "Hectares",
      countVal: `${Math.floor(Math.random() * 15) + 5}`,
      temp: "27°C",
      nextIrrigation: "Tomorrow • 06:30",
      filterClass: "hue-rotate-[90deg] saturate-[1.2]",
      lat,
      lon,
      state: state || "Tamil Nadu",
      city: city || newLocation.trim(),
      soilType,
      ph,
      organic,
      organicPct,
      healthScore
    };

    const updatedList = [...fieldsList, newFieldObj];
    setFieldsList(updatedList);
    localStorage.setItem("agroot_fields_list", JSON.stringify(updatedList));

    // Update fieldNames map
    const savedNames = localStorage.getItem("agroot_field_names");
    let currentNames = {};
    if (savedNames) {
      try { currentNames = JSON.parse(savedNames); } catch (e) {}
    }
    const updatedNames = {
      ...currentNames,
      [newId]: newFieldName.trim()
    };
    localStorage.setItem("agroot_field_names", JSON.stringify(updatedNames));
    setFieldNames(updatedNames);

    // Auto-select the newly added field
    setSelectedFieldId(newId);
    setUsingGPS(false);

    // Reset inputs
    setNewFieldName("");
    setNewCropName("");
    setNewLocation("");
    setGeocodingLoading(false);
    setAddModalOpen(false);
  };

  const handleGPSLocation = () => {
    if (navigator.geolocation) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
          setUsingGPS(true);
          setGpsLoading(false);
        },
        (error) => {
          alert("Error retrieving current location: " + error.message);
          setGpsLoading(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Fetch geocoding & weather information dynamically when GPS focus is active
  useEffect(() => {
    if (usingGPS && gpsCoords) {
      const fetchGPSDetails = async () => {
        setGpsLoading(true);
        const lat = gpsCoords.lat;
        const lon = gpsCoords.lon;
        
        let city = "My Location";
        let state = "";
        let soilType = "Alluvial";
        let ph = 7.0;
        let organic = "Medium";
        let organicPct = "2.2";
        let healthScore = 78;
        
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
          );
          const geoData = await geoRes.json();
          if (geoData && geoData.address) {
            state = geoData.address.state || "";
            city = geoData.address.city || geoData.address.town || geoData.address.village || "My Location";
            
            const SOIL_DB_MOCK = {
              "Tamil Nadu": { type: "Red Laterite", ph: 6.4, organic: "Medium", organicPct: "2.1", healthScore: 72 },
              "Kerala": { type: "Laterite", ph: 5.2, organic: "High", organicPct: "3.4", healthScore: 78 },
              "Karnataka": { type: "Red & Black", ph: 7.0, organic: "Medium", organicPct: "2.5", healthScore: 74 },
              "Andhra Pradesh": { type: "Black Cotton", ph: 8.0, organic: "Low", organicPct: "1.2", healthScore: 60 },
              "Telangana": { type: "Red Sandy", ph: 6.5, organic: "Low", organicPct: "1.5", healthScore: 55 },
              "Maharashtra": { type: "Regur (Black)", ph: 7.5, organic: "Medium", organicPct: "2.2", healthScore: 70 },
              "Gujarat": { type: "Alluvial", ph: 7.8, organic: "Medium", organicPct: "2.4", healthScore: 76 },
              "Rajasthan": { type: "Desert Sandy", ph: 8.2, organic: "Low", organicPct: "0.9", healthScore: 48 },
              "Uttar Pradesh": { type: "Alluvial", ph: 7.0, organic: "High", organicPct: "2.9", healthScore: 88 },
              "Punjab": { type: "Alluvial", ph: 7.5, organic: "High", organicPct: "3.1", healthScore: 90 },
              "Haryana": { type: "Alluvial", ph: 7.8, organic: "Medium", organicPct: "2.6", healthScore: 80 },
              "West Bengal": { type: "Alluvial", ph: 6.0, organic: "High", organicPct: "3.0", healthScore: 86 },
              "Bihar": { type: "Alluvial", ph: 7.0, organic: "Medium", organicPct: "2.3", healthScore: 78 },
            };
            
            const match = Object.keys(SOIL_DB_MOCK).find(k => 
              state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
            );
            if (match) {
              soilType = SOIL_DB_MOCK[match].type;
              ph = SOIL_DB_MOCK[match].ph;
              organic = SOIL_DB_MOCK[match].organic;
              organicPct = SOIL_DB_MOCK[match].organicPct;
              healthScore = SOIL_DB_MOCK[match].healthScore;
            }
          }
        } catch (err) {
          console.error("Reverse geocoding failed:", err);
        }
        
        let temp = "25°C";
        let humidity = "60%";
        let windSpeed = "10 km/h";
        let weatherDesc = "Clear Sky";
        
        try {
          const weatherRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
          );
          const weatherData = await weatherRes.json();
          if (weatherData && weatherData.current) {
            temp = `${Math.round(weatherData.current.temperature_2m)}°C`;
            humidity = `${weatherData.current.relative_humidity_2m}%`;
            windSpeed = `${weatherData.current.wind_speed_10m} km/h`;
            
            const code = weatherData.current.weather_code;
            if (code === 0) weatherDesc = "Clear Sky";
            else if (code >= 1 && code <= 3) weatherDesc = "Partly Cloudy";
            else if (code >= 51 && code <= 67) weatherDesc = "Rainy";
            else if (code >= 95) weatherDesc = "Thunderstorm";
            else weatherDesc = "Stable Climate";
          }
        } catch (err) {
          console.error("Weather fetching failed:", err);
        }
        
        setGpsLocationData({
          city,
          state,
          soilType,
          ph,
          organic,
          organicPct,
          healthScore,
          temp,
          humidity,
          windSpeed,
          weatherDesc
        });
        setGpsLoading(false);
      };
      
      fetchGPSDetails();
    }
  }, [usingGPS, gpsCoords]);

  // Handle auto-GPS centering on mount when arriving from dashboard tool card
  useEffect(() => {
    if (location.state?.fromSatelliteTool) {
      handleGPSLocation();
    }
  }, [location.state]);

  const sidebarItems = [
    { label: "Dashboard", path: "/home" },
    { label: "Fields", active: true },
    { label: "Crops", path: "/seeds" },
    { label: "Analytics", path: "/costs" },
    { label: "Irrigation", path: "/weather" },
    { label: "Alerts", path: "/alerts" },
    { label: "Reports", path: "/profile" },
    { label: "Settings", path: "/profile" }
  ];

  const currentFieldData = usingGPS && gpsCoords
    ? {
        cropName: "My Location",
        cropIcon: "🛰️",
        yieldProgress: "100%",
        moisture: gpsLocationData.humidity !== "—" ? gpsLocationData.humidity : "60%",
        countLabel: "GPS Position",
        countVal: gpsCoords ? `${gpsCoords.lat.toFixed(3)}°N, ${gpsCoords.lon.toFixed(3)}°E` : "Detecting...",
        temp: gpsLocationData.temp,
        nextIrrigation: "N/A",
        lat: gpsCoords?.lat || 20.5937,
        lon: gpsCoords?.lon || 78.9629,
        state: gpsLocationData.state,
        city: gpsLocationData.city,
        soilType: gpsLocationData.soilType,
        ph: gpsLocationData.ph,
        organic: gpsLocationData.organic,
        organicPct: gpsLocationData.organicPct,
        healthScore: gpsLocationData.healthScore
      }
    : (fieldsList.find(f => f.id === selectedFieldId) || fieldsList[0] || DEFAULT_FIELDS[0]);

  return (
    <div className="min-h-screen w-full font-sans flex bg-[#F8F9FA] text-[#1A2E1A] overflow-hidden">
      
      {/* ── LEFT SIDEBAR (WIDESCREEN ONLY) ── */}
      <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-white border-r border-[#EFEBE3] p-4 shrink-0 z-20 select-none">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-[#EFEBE3]/60 w-full gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/50 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 21V10" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 14c1.5-1 2.5-2.5 2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 17c-1.5-1-2.5-2.5-2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-955 uppercase mt-1">AGROOT</span>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 mt-5">
              {sidebarItems.map(item => {
                const isActive = item.active;
                return (
                  <button
                    key={item.label}
                    onClick={() => item.path && navigate(item.path)}
                    className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide transition-all duration-300 ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-900 border border-emerald-500/10 shadow-sm shadow-emerald-500/5" 
                        : "text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50"
                    }`}
                  >
                    <span className={`shrink-0 transition-colors ${isActive ? "text-emerald-600" : "text-gray-400"}`}>
                      {renderSidebarIcon(item.label, isActive)}
                    </span>
                    <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center py-2">
            v1.2.0
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <div className="flex-1 h-screen overflow-y-auto flex flex-col z-10 relative">
        <main className="p-5 lg:p-8 space-y-6 pb-24 max-w-7xl mx-auto w-full">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-955">Farm Fields</h1>
              <p className="text-xs text-gray-400 font-bold mt-1">Track soil parameters, crop yields, and satellite positions</p>
            </div>
            {/* Quick Back button for mobile */}
            <button 
              onClick={() => navigate("/home")} 
              className="lg:hidden px-4 py-2 rounded-xl border border-[#EFEBE3] bg-white text-emerald-955 text-xs font-black hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Split Pane Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            
            {/* Left Column: Scrollable list of fields */}
            <div className="xl:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2.5" />
                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                  </svg>
                  <h3 className="text-[11px] uppercase tracking-widest font-black text-gray-400">Select Active Zone</h3>
                </div>
                {/* Add Field Button */}
                <button
                  onClick={() => setAddModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-800 text-white font-black text-[10px] tracking-wide hover:bg-emerald-900 shadow-sm transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer pointer-events-auto"
                >
                  ➕ Add Field
                </button>
              </div>

              <div className="space-y-4">
                {fieldsList.map((field) => {
                  const id = field.id;
                  const isSelected = selectedFieldId === id && !usingGPS;
                  return (
                    <motion.div
                      key={id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => {
                        setSelectedFieldId(id);
                        setUsingGPS(false);
                      }}
                      className={`cursor-pointer rounded-[2.2rem] p-6 shadow-sm border transition-all flex flex-col justify-between gap-4 ${
                        isSelected 
                          ? "bg-emerald-800 text-white border-emerald-600 shadow-sm" 
                          : "bg-white text-emerald-955 border-[#EFEBE3] hover:border-emerald-500/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                            isSelected ? "bg-white/10" : "bg-[#E8F5E9]/50 border border-emerald-500/10"
                          }`}>
                            {field.cropIcon}
                          </div>
                          <div>
                            <h4 className="font-black text-base tracking-tight leading-none">Field {id}</h4>
                            <p className={`text-xs font-bold mt-1.5 ${isSelected ? "text-emerald-250" : "text-emerald-600"}`}>
                              {fieldNames[id] || field.cropName}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-sm ${
                            isSelected 
                              ? "bg-white/15 text-white" 
                              : "bg-emerald-50/50 text-emerald-800 border border-emerald-500/10"
                          }`}>
                            {field.city}, {field.state}
                          </span>
                          
                          <button
                            onClick={(e) => handleDeleteField(id, e)}
                            className={`p-2 rounded-xl border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20 hover:border-white/30"
                                : "bg-red-50/50 border-red-500/10 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-500/20"
                            }`}
                            title="Delete Field"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 border-t pt-4 border-current/10 text-center">
                        <div>
                          <p className={`text-[9px] font-extrabold uppercase tracking-widest ${isSelected ? "text-emerald-200/70" : "text-gray-450"}`}>Moisture</p>
                          <p className="font-black text-sm mt-1">{field.moisture}</p>
                        </div>
                        <div>
                          <p className={`text-[9px] font-extrabold uppercase tracking-widest ${isSelected ? "text-emerald-200/70" : "text-gray-450"}`}>Area size</p>
                          <p className="font-black text-sm mt-1">{field.countVal} {field.countLabel.substring(0, 2)}</p>
                        </div>
                        <div>
                          <p className={`text-[9px] font-extrabold uppercase tracking-widest ${isSelected ? "text-emerald-200/70" : "text-gray-450"}`}>Yield Est.</p>
                          <p className="font-black text-sm mt-1">{field.yieldProgress}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Sticky analytics dashboard details for selected field */}
            <div className="xl:col-span-6">
              <div className="xl:sticky xl:top-8 space-y-6">
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  <h3 className="text-[11px] uppercase tracking-widest font-black text-gray-400">Live Analytics Panel</h3>
                </div>

                <div className="bg-white rounded-[2.2rem] p-6 shadow-sm border border-[#EFEBE3] space-y-6">
                  
                  {/* Title block */}
                  <div className="flex justify-between items-center border-b border-[#EFEBE3]/60 pb-5">
                    <div>
                      <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-500/10 px-2.5 py-1 rounded-md">
                        {usingGPS ? "GPS" : `Zone ${selectedFieldId}`}
                      </span>
                      {usingGPS ? (
                        <h3 className="font-black text-lg text-emerald-955 mt-2 tracking-tight">
                          My Location Analytics
                        </h3>
                      ) : isEditingName ? (
                        <div className="flex items-center gap-1.5 mt-2">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveFieldName();
                                else if (e.key === "Escape") setIsEditingName(false);
                            }}
                            className="bg-emerald-50 text-emerald-950 font-black text-xs px-2 py-1 rounded-lg outline-none border border-emerald-500/20 w-44"
                            autoFocus
                          />
                          <button 
                            onClick={handleSaveFieldName}
                            className="w-6 h-6 rounded-lg bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center text-[10px] text-white shadow-sm font-bold"
                          >
                            ✓
                          </button>
                          <button 
                            onClick={() => setIsEditingName(false)}
                            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-[10px] text-gray-500"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <h3 className="font-black text-lg text-emerald-955 mt-2 tracking-tight flex items-center gap-2">
                          <span>{fieldNames[selectedFieldId] || currentFieldData.cropName} Analytics</span>
                          <button 
                            onClick={() => {
                              setTempName(fieldNames[selectedFieldId] || currentFieldData.cropName);
                              setIsEditingName(true);
                            }}
                            className="p-1 rounded hover:bg-gray-100 flex items-center justify-center transition-all shrink-0"
                            title="Edit field name"
                          >
                            <svg className="w-3.5 h-3.5 text-gray-400 hover:text-emerald-855 transition-colors" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </h3>
                      )}
                      <p className="text-[10px] text-gray-450 font-bold mt-1">Real-time parameters for crop cycle</p>
                    </div>

                    <div className="flex gap-1.5 bg-gray-50 border border-[#EFEBE3]/60 rounded-xl p-1 shrink-0">
                      <button 
                        onClick={() => setMapType("satellite")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          mapType === "satellite" ? "bg-emerald-800 text-white shadow-sm" : "text-gray-400 hover:text-emerald-955"
                        }`}
                      >
                        🛰️ Satellite
                      </button>
                      <button 
                        onClick={() => setMapType("street")}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          mapType === "street" ? "bg-emerald-800 text-white shadow-sm" : "text-gray-400 hover:text-emerald-955"
                        }`}
                      >
                        🗺️ Map
                      </button>
                    </div>
                  </div>

                  {/* Interactive Leaflet Map Wrapper */}
                  <div className="h-[220px] rounded-3xl overflow-hidden shadow-inner border border-[#EFEBE3]/60 relative z-0">
                    {usingGPS && gpsLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-55/60 backdrop-blur-[1px] gap-3 z-10">
                        <div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-600 rounded-full animate-spin" />
                        <p className="text-[11px] text-emerald-955/75 font-black">Acquiring current GPS position...</p>
                      </div>
                    ) : null}

                    <MapContainer
                      center={[currentFieldData.lat, currentFieldData.lon]}
                      zoom={14}
                      style={{ height: "100%", width: "100%" }}
                      zoomControl={false}
                    >
                      <RecenterMap 
                        lat={currentFieldData.lat} 
                        lon={currentFieldData.lon} 
                      />
                      <TileLayer
                        key={mapType}
                        url={
                          mapType === "satellite" 
                            ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
                            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        }
                        attribution={
                          mapType === "satellite" 
                            ? "Tiles © Esri" 
                            : "© OpenStreetMap contributors"
                        }
                        maxZoom={19}
                      />
                      <Marker position={[currentFieldData.lat, currentFieldData.lon]}>
                        <Popup>
                          <div className="text-xs font-bold">📍 {usingGPS ? "My GPS Location" : `Field ${selectedFieldId}`}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{currentFieldData.city}, {currentFieldData.state}</div>
                        </Popup>
                      </Marker>
                    </MapContainer>

                    {/* Floating GPS Button */}
                    <button 
                      onClick={handleGPSLocation}
                      className={`absolute bottom-3 right-3 z-[1000] border w-9 h-9 rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all ${
                        usingGPS 
                          ? "bg-emerald-800 border-emerald-600 text-white animate-pulse" 
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                      title="Center on my GPS location"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                    </button>
                  </div>

                  {/* Stats & Progress indicators */}
                  <div className="space-y-5">
                    
                    {/* Yield Progress */}
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-2">
                        <span>Harvest Yield Progress</span>
                        <span className="text-emerald-800 font-black">{currentFieldData.yieldProgress}</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden border border-[#EFEBE3]/60 shadow-inner">
                        <div className="h-full bg-emerald-600 rounded-full" style={{ width: currentFieldData.yieldProgress }} />
                      </div>
                    </div>

                    {/* pH scale indicator */}
                    <div className="border border-[#EFEBE3]/60 rounded-2xl p-4 bg-[#FCFBF8] relative flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center">
                          <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest">Soil pH Level</p>
                          <span className="text-[9px] font-extrabold text-emerald-855 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-500/10">
                            {currentFieldData.soilType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="font-black text-lg text-emerald-955">{currentFieldData.ph}</span>
                          <span className="text-[10px] text-gray-400 font-extrabold">
                            ({currentFieldData.ph >= 7.0 ? "Neutral / Alkaline" : "Acidic"})
                          </span>
                        </div>
                      </div>
                      
                      {/* pH range slider scale visualizer */}
                      <div className="relative h-1.5 w-full rounded-full mt-3.5" style={{ background: "linear-gradient(to right, #FFA726 0%, #FFEE58 40%, #66BB6A 70%, #29B6F6 100%)" }}>
                        <div 
                          className="absolute w-3.5 h-3.5 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-emerald-950 shadow flex items-center justify-center" 
                          style={{ left: `${Math.max(8, Math.min(92, ((currentFieldData.ph - 4) / 6) * 100))}%` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-950" />
                        </div>
                      </div>
                      <div className="flex justify-between text-[8px] text-gray-400 font-bold mt-2 px-0.5">
                        <span>pH 4.0</span>
                        <span>pH 7.0</span>
                        <span>pH 10.0</span>
                      </div>
                    </div>

                    {/* Soil parameters / Climate */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="border border-[#EFEBE3]/60 rounded-2xl p-4 bg-[#FCFBF8] flex flex-col justify-between min-h-[100px]">
                        <div>
                          <p className="text-[9px] text-gray-450 font-extrabold uppercase tracking-widest">Organic Matter</p>
                          <div className="flex items-baseline gap-1 mt-1.5">
                            <span className="font-black text-base text-emerald-955">{currentFieldData.organic}</span>
                            <span className="text-[10px] text-gray-400 font-bold">({currentFieldData.organicPct}%)</span>
                          </div>
                        </div>
                        <p className="text-[8.5px] text-gray-450 font-medium">Favorable organic baseline</p>
                      </div>

                      <div className="border border-[#EFEBE3]/60 rounded-2xl p-4 bg-[#FCFBF8] flex flex-col justify-between min-h-[100px]">
                        <div>
                          <p className="text-[9px] text-gray-450 font-extrabold uppercase tracking-widest">Soil Health</p>
                          <div className="flex items-baseline gap-1 mt-1.5">
                            <span className="font-black text-base text-emerald-955">{currentFieldData.healthScore}%</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase tracking-wider self-start">
                          Nominal
                        </span>
                      </div>

                    </div>

                    {/* Climate / Irrigation schedule footer */}
                    <div className="flex items-center justify-between border-t border-[#EFEBE3]/60 pt-4 text-xs font-bold text-gray-750">
                      <div className="flex items-center gap-1.5">
                        <span>🌡️ Temp: <span className="font-black text-emerald-955">{currentFieldData.temp}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span>💦 Next Irrigation: <span className="font-black text-emerald-955">{currentFieldData.nextIrrigation}</span></span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>
      {/* ── ADD FIELD MODAL ── */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] px-4 pointer-events-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0a1912]/45 backdrop-blur-md"
              onClick={() => { if (!geocodingLoading) setAddModalOpen(false); }}
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-white rounded-[2.2rem] shadow-[0_30px_70px_-15px_rgba(10,25,18,0.35)] p-6 border border-[#EFEBE3] relative z-10"
            >
              <div className="flex justify-between items-center mb-5 border-b border-[#EFEBE3]/60 pb-4">
                <div>
                  <h3 className="font-black text-[17px] text-emerald-955 tracking-tight">Add New Farm Field</h3>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">Configure your field zone boundaries</p>
                </div>
                <button 
                  onClick={() => setAddModalOpen(false)}
                  disabled={geocodingLoading}
                  className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all disabled:opacity-50 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddField} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Field Name</label>
                  <input
                    type="text"
                    required
                    disabled={geocodingLoading}
                    placeholder="e.g. North Wheat Zone"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Crop Name / Type</label>
                  <input
                    type="text"
                    required
                    disabled={geocodingLoading}
                    placeholder="e.g. Wheat, Rice Paddy, Apple Orchard"
                    value={newCropName}
                    onChange={(e) => setNewCropName(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-gray-400 font-extrabold uppercase tracking-wider mb-1.5">Location (City, State)</label>
                  <input
                    type="text"
                    required
                    disabled={geocodingLoading}
                    placeholder="e.g. Coimbatore, Tamil Nadu"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-xs outline-none border border-emerald-500/10 focus:border-emerald-500/30 transition-all bg-[#FCFBF8] text-emerald-955 font-bold"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    disabled={geocodingLoading}
                    className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 font-black text-xs hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={geocodingLoading}
                    className="flex-1 py-3 rounded-2xl bg-emerald-800 text-white font-black text-xs hover:bg-emerald-900 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {geocodingLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Locating...</span>
                      </>
                    ) : (
                      <span>Save Field</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SatelliteView;
