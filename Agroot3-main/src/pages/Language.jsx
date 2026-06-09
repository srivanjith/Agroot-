import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { updateUserLanguage } from "../firebase/user";

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
];

const Language = () => {
  const navigate = useNavigate();
  const [debugLogs, setDebugLogs] = useState(["Language Page Ready"]);
  const addLog = (msg) => setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
  const { setLanguage } = useApp();
  const user = JSON.parse(localStorage.getItem("agroot_user"));

  const selectLang = async (langCode) => {
    addLog(`Selected: ${langCode}`);
    // 1️⃣ Save globally
    setLanguage(langCode);

    // 2️⃣ Save to Firestore (non-blocking)
    if (user?.phone) {
      addLog("Saving to Firestore...");
      updateUserLanguage(`${user.phone}@agroot.local`, langCode)
        .then(() => addLog("Firestore Saved"))
        .catch(err => addLog(`Firestore Failed (Ignored): ${err.message}`));
    } else {
      addLog("No User Phone found");
    }

    // 3️⃣ Navigate immediately (don't wait for DB)
    addLog("Navigating to Home...");
    setTimeout(() => {
      navigate("/home");
    }, 100); // Small delay to show log
  };

  return (
    <div className="min-h-screen grid grid-cols-2 bg-gradient-to-br from-green-50 to-green-100 relative">

      {/* Left section */}
      <div className="flex flex-col justify-center px-20 bg-gradient-to-br from-green-700 to-green-600 text-white">
        <h1 className="text-5xl font-bold mb-4">Choose Your Language 🌍</h1>
        <p className="text-lg mb-6">Agroot adapts to your comfort.</p>
        <p className="text-sm opacity-90">
          Select your preferred language to receive farming guidance,
          alerts, and recommendations in the language you understand best.
        </p>
      </div>

      {/* Right section */}
      <div className="flex items-center justify-center px-6">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-10">
          <h2 className="text-2xl font-bold text-center mb-8">
            Select Language
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLang(lang.code)}
                className="py-4 rounded-xl bg-gray-900 text-white text-lg font-semibold hover:bg-green-700 transition"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Debug Console Overlay */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-black bg-opacity-90 text-green-400 font-mono text-xs p-2 overflow-y-auto pointer-events-none z-50">
        <div className="font-bold border-b border-gray-700 mb-1">LANG DEBUG LOGS</div>
        {debugLogs.map((log, i) => (
          <div key={i}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export default Language;