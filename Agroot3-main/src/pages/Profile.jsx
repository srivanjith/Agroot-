import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const STATES_LIST = [
  "Tamil Nadu",
  "Kerala",
  "Karnataka",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "Punjab",
  "Haryana",
  "West Bengal",
  "Bihar"
];

const Profile = () => {
  const navigate = useNavigate();
  
  // Form fields states
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [debugLogs, setDebugLogs] = useState(["Profile Initialized"]);

  const addLog = (msg) => setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  // Load profile from LocalStorage & DB on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("agroot_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        addLog(`Found local cache for ${parsed.email}`);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.phone) setPhone(parsed.phone);
        
        // Fetch full profile from MySQL backend
        fetchProfile(parsed.email);
      } catch (e) {
        addLog(`Cache parse error: ${e.message}`);
      }
    } else {
      addLog("No user cache found in LocalStorage");
      // If no cache, redirect to login for security
      navigate("/");
    }
  }, []);

  const fetchProfile = async (userEmail) => {
    if (!userEmail) return;
    addLog(`Fetching details from MySQL for: ${userEmail}`);
    try {
      const res = await fetch(`http://localhost:5000/getProfile?email=${encodeURIComponent(userEmail)}`);
      if (res.ok) {
        const data = await res.json();
        addLog("MySQL fetch successful");
        if (data.name) setName(data.name);
        if (data.phone) setPhone(data.phone);
        if (data.state) setState(data.state);
        if (data.city) setCity(data.city);
      } else {
        addLog(`MySQL user record not found or error status: ${res.status}`);
      }
    } catch (e) {
      addLog(`MySQL Fetch Error: ${e.message}`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Email is required as an identifier");
      return;
    }
    
    setLoading(true);
    setErrorMsg("");
    setSaveSuccess(false);
    addLog("Saving profile details to MySQL...");

    try {
      const response = await fetch("http://localhost:5000/updateProfile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          name,
          phone,
          state,
          city
        })
      });

      if (response.ok) {
        const result = await response.json();
        addLog("Profile saved to SQL storage!");
        setSaveSuccess(true);
        
        // Update LocalStorage cache
        localStorage.setItem("agroot_user", JSON.stringify({ email, phone }));
        
        // Hide success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        addLog(`Failed to save: ${errorData.error || response.statusText}`);
        setErrorMsg("Failed to save profile. Server error.");
      }
    } catch (err) {
      addLog(`Save Request Error: ${err.message}`);
      setErrorMsg("Connection to server failed. Is backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full font-sans flex flex-col pb-24" style={{ background: "var(--agroot-cream)" }}>
      {/* ── HEADER ── */}
      <header
        className="px-5 pt-10 pb-6 relative overflow-hidden flex-none"
        style={{ background: "var(--agroot-forest)" }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <button
            onClick={() => navigate("/home")}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors bg-white/10 hover:bg-white/20"
          >
            <span className="text-white text-xl">‹</span>
          </button>

          <h1 className="text-white font-bold text-xl tracking-wide text-center">User Profile</h1>

          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      {/* ── MAIN FORM CARD ── */}
      <div className="flex-1 px-5 py-6 max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-tan"
          style={{ borderColor: "var(--agroot-tan-light)" }}
        >
          <div className="flex flex-col items-center mb-6">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-2 shadow-sm"
              style={{ background: "var(--agroot-forest)" }}
            >
              {name ? name[0].toUpperCase() : "👤"}
            </div>
            <p className="text-sm font-semibold text-gray-500">{email}</p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Name input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Add Name"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all text-[#2D4A3E] bg-[#FAF7F0] focus:bg-white border-[#E0D9CC] focus:border-[#8ABF82]"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Email Input (Readonly representation as identifier) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border text-gray-400 bg-gray-100 border-[#E0D9CC] cursor-not-allowed"
                value={email}
              />
            </div>

            {/* Phone input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="Add Phone Number"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all text-[#2D4A3E] bg-[#FAF7F0] focus:bg-white border-[#E0D9CC] focus:border-[#8ABF82]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {/* State selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                State
              </label>
              <select
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all text-[#2D4A3E] bg-[#FAF7F0] focus:bg-white border-[#E0D9CC] focus:border-[#8ABF82]"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                <option value="">Select State</option>
                {STATES_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* City input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                City / Town
              </label>
              <input
                type="text"
                placeholder="Add City"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none border transition-all text-[#2D4A3E] bg-[#FAF7F0] focus:bg-white border-[#E0D9CC] focus:border-[#8ABF82]"
                value={city}
                onChange={(e) => city !== undefined ? setCity(e.target.value) : setCity("")}
              />
            </div>

            {/* Success and Error messages */}
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl text-center bg-green-50 border border-green-200 text-green-700 text-xs font-medium"
              >
                ✓ Profile saved to SQL storage successfully!
              </motion.div>
            )}

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl text-center bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
              >
                ⚠ {errorMsg}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl text-white font-semibold text-sm shadow-sm transition-all relative overflow-hidden flex items-center justify-center gap-2"
              style={{
                background: "var(--agroot-forest)",
                opacity: loading ? 0.8 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-16 flex items-center justify-around px-6 z-30"
        style={{
          background: "rgba(255,250,240,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid var(--agroot-tan-light)"
        }}
      >
        <button onClick={() => navigate("/calendar")} className="flex flex-col items-center gap-1">
          <span className="text-xl">📅</span>
          <span className="text-[10px] text-gray-500">Calendar</span>
        </button>
        <button
          onClick={() => navigate("/chat")}
          className="flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg -mt-5"
          style={{ background: "var(--agroot-forest)" }}
        >
          <span className="text-2xl">🎙️</span>
        </button>
        <button onClick={() => navigate("/profile")} className="flex flex-col items-center gap-1">
          <span className="text-xl" style={{ color: "var(--agroot-forest)" }}>👤</span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--agroot-forest)" }}>Profile</span>
        </button>
      </div>

      {/* Debug Console Overlay */}
      <div className="fixed bottom-16 left-0 w-full h-20 bg-black bg-opacity-90 text-green-400 font-mono text-[10px] p-2 overflow-y-auto pointer-events-none z-50">
        <div className="font-bold border-b border-gray-700 mb-0.5">PROFILE DB LOGS</div>
        {debugLogs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
