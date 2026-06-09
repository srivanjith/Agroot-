import { useApp } from "../context/AppContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Thanjavur coordinates 
const LAT = 10.7867;
const LON = 79.1378;

const TEXT = {
  en: {
    title: "WEATHER INTELLIGENCE",
    subtitle: "Climate-driven farming decisions",
    location: "Thanjavur, Tamil Nadu",
    current: "Current Conditions",
    advisory: "Farming Advisory",
    outlook: "3-Day Outlook",
    irrigateYes: "Irrigation Recommended",
    irrigateNo: "Irrigation Not Required",
    irrigateYesDesc:
      "Low rainfall probability detected. Controlled irrigation is advised.",
    irrigateNoDesc:
      "Rainfall probability is high. Avoid irrigation to prevent waterlogging.",
    powered: "Powered by Open‑Meteo (free & open)",
  },
  ta: {
    title: "வானிலை அறிவு",
    subtitle: "விவசாயத்திற்கான காலநிலை முடிவுகள்",
    location: "தஞ்சாவூர், தமிழ்நாடு",
    current: "தற்போதைய நிலை",
    advisory: "விவசாய அறிவுரை",
    outlook: "3 நாள் முன்னறிவு",
    irrigateYes: "நீர்ப்பாசனம் பரிந்துரை",
    irrigateNo: "நீர்ப்பாசனம் தேவையில்லை",
    irrigateYesDesc:
      "மழை வாய்ப்பு குறைவு. கட்டுப்படுத்தப்பட்ட நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.",
    irrigateNoDesc:
      "மழை வாய்ப்பு அதிகம். நீர் தேக்கம் தவிர்க்க நீர்ப்பாசனம் வேண்டாம்.",
    powered: "Open‑Meteo மூலம் இயக்கப்படுகிறது",
  },
  hi: {
    title: "मौसम जानकारी",
    subtitle: "कृषि के लिए मौसम आधारित निर्णय",
    location: "तंजावुर, तमिलनाडु",
    current: "वर्तमान स्थिति",
    advisory: "कृषि सलाह",
    outlook: "3 दिन का पूर्वानुमान",
    irrigateYes: "सिंचाई की सलाह",
    irrigateNo: "सिंचाई की आवश्यकता नहीं",
    irrigateYesDesc:
      "वर्षा की संभावना कम है। नियंत्रित सिंचाई की सलाह दी जाती है।",
    irrigateNoDesc:
      "वर्षा की संभावना अधिक है। जलभराव से बचने के लिए सिंचाई न करें।",
    powered: "Open‑Meteo द्वारा संचालित",
  },
  ml: {
    title: "കാലാവസ്ഥ വിവരങ്ങൾ",
    subtitle: "കൃഷിക്കായി കാലാവസ്ഥാ അടിസ്ഥാനത്തിലുള്ള തീരുമാനങ്ങൾ",
    location: "തഞ്ചാവൂർ, തമിഴ്നാട്",
    current: "നിലവിലെ അവസ്ഥ",
    advisory: "കൃഷി നിർദ്ദേശം",
    outlook: "3 ദിവസത്തെ പ്രവചനം",
    irrigateYes: "നനവ് ശുപാർശ ചെയ്യുന്നു",
    irrigateNo: "നനവ് ആവശ്യമില്ല",
    irrigateYesDesc:
      "മഴ സാധ്യത കുറവാണ്. നിയന്ത്രിത നനവ് ശുപാർശ ചെയ്യുന്നു.",
    irrigateNoDesc:
      "മഴ സാധ്യത കൂടുതലാണ്. വെള്ളം കെട്ടിയൊഴുകുന്നത് ഒഴിവാക്കുക.",
    powered: "Open‑Meteo ഉപയോഗിച്ച്",
  },
};

const Weather = () => {
  const { language } = useApp();
  const t = TEXT[language] || TEXT.en;
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState("Detecting location...");
  const [error, setError] = useState(null);

  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.county ||
        "Your Location";
      const state = data.address?.state || "";
      setLocationName(state ? `${city}, ${state}` : city);
    } catch {
      setLocationName("Your Location");
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(latitude, longitude);
          reverseGeocode(latitude, longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setError("Location access denied. Showing default (Delhi).");
          setLocationName("New Delhi, India");
          fetchWeather(28.61, 77.20);
        }
      );
    } else {
      setError("Geolocation not supported. Showing default.");
      setLocationName("New Delhi, India");
      fetchWeather(28.61, 77.20);
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await response.json();
      setWeather(data);

      // Store rain status for other components
      const isRaining = data.current.weather_code >= 51 && data.current.weather_code <= 67;
      localStorage.setItem("agroot_rain", isRaining);
    } catch (error) {
      console.error("Error fetching weather:", error);
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if (code >= 1 && code <= 3) return "⛅";
    if (code >= 45 && code <= 48) return "🌫";
    if (code >= 51 && code <= 67) return "🌧";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 95) return "⛈";
    return "🌡";
  };

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-green-50 text-green-800">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="animate-pulse">Loading Forecast...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full bg-green-50 text-gray-800 flex flex-col font-sans">

      {/* Header / Current Weather - Green (50%) */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none bg-green-700 text-white rounded-b-[2.5rem] px-6 md:px-16 py-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

        <div className="flex items-center justify-between mb-8 relative z-10">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            ← Back
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-green-100 flex items-center justify-end gap-1">
              <span>📍</span>{locationName}
            </p>
            <p className="text-xs text-green-200 opacity-70">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {weather && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center md:text-left"
            >
              <div className="text-8xl md:text-9xl mb-2 drop-shadow-lg">
                {getWeatherIcon(weather.current.weather_code)}
              </div>
            </motion.div>

            <div className="flex-1 w-full md:w-auto">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8"
              >
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-green-100 text-sm uppercase tracking-wider mb-1">Temperature</p>
                    <p className="text-5xl md:text-6xl font-bold">{Math.round(weather.current.temperature_2m)}°C</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm uppercase tracking-wider mb-1">Wind</p>
                    <p className="text-xl md:text-2xl font-semibold">{weather.current.wind_speed_10m} km/h</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-100 mb-1">Humidity</p>
                    <p className="font-semibold">{weather.current.relative_humidity_2m}%</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 text-center">
                    <p className="text-xs text-green-100 mb-1">Precipitation</p>
                    <p className="font-semibold">0%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </motion.header>

      {/* Forecast Section - White (50%) */}
      <div className="flex-1 px-6 md:px-16 py-8">
        <h2 className="text-lg font-bold text-green-900 mb-6 flex items-center gap-2">
          <span>📅</span> 7-Day Forecast
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {weather && weather.daily.time.map((day, i) => (
            <motion.div
              key={day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="bg-white border border-green-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group"
            >
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-800">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                  <span className="text-sm text-gray-400">/ {Math.round(weather.daily.temperature_2m_min[i])}°</span>
                </div>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform">
                {getWeatherIcon(weather.daily.weather_code[i])}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Weather;