import "./weather-animations.css";          /* ← Vite bundles this always */
import { useApp } from "../context/AppContext";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

/* ══════════════════════════════════════════════
   SVG cloud shape  (light or dark variant)
   ══════════════════════════════════════════════ */
const Cloud = ({ w = 190, h = 76, variant = "light" }) => {
  const fills =
    variant === "dark"
      ? ["rgba(55,78,100,.92)", "rgba(65,90,112,.82)", "rgba(75,100,122,.70)"]
      : ["rgba(255,255,255,.90)", "rgba(255,255,255,.74)", "rgba(255,255,255,.56)"];
  return (
    <svg width={w} height={h} viewBox="0 0 190 76" fill="none" style={{ display: "block" }}>
      <ellipse cx="95"  cy="63" rx="82" ry="14" fill={fills[0]} />
      <ellipse cx="65"  cy="47" rx="45" ry="30" fill={fills[0]} />
      <ellipse cx="116" cy="43" rx="40" ry="26" fill={fills[1]} />
      <ellipse cx="88"  cy="35" rx="36" ry="24" fill={fills[1]} />
      <ellipse cx="140" cy="52" rx="28" ry="19" fill={fills[2]} />
      <ellipse cx="50"  cy="55" rx="25" ry="17" fill={fills[2]} />
    </svg>
  );
};

/* ══════════════════════════════════════════════
   ☀️  SUNNY ANIMATION
   ══════════════════════════════════════════════ */
const SunnyAnimation = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>

    {/* Warm amber sky tint */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(165deg, rgba(255,185,30,.22) 0%, rgba(255,100,0,.10) 45%, rgba(0,120,60,.04) 100%)",
      animation: "skyGlow 4.5s ease-in-out infinite",
    }} />

    {/* Horizon glow */}
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
      background: "linear-gradient(0deg, rgba(255,130,0,.18) 0%, transparent 100%)",
    }} />

    {/* 18 radiating sun rays */}
    {Array.from({ length: 18 }, (_, i) => (
      <div key={i} style={{
        position: "absolute",
        left: "18%", top: "68%",
        width: 5, height: 76 + (i % 5) * 18,
        background: "linear-gradient(180deg, rgba(255,228,50,.72) 0%, rgba(255,200,30,0) 100%)",
        borderRadius: 5,
        transformOrigin: "50% calc(-76px)",
        transform: `rotate(${i * 20}deg)`,
        animation: `rayBreath ${1.7 + (i % 5) * 0.24}s ease-in-out ${i * 0.09}s infinite`,
      }} />
    ))}

    {/* Sun disc */}
    <div style={{
      position: "absolute",
      left: "18%", top: "68%",
      width: 110, height: 110,
      borderRadius: "50%",
      background: "radial-gradient(circle at 40% 36%, #fffde7 0%, #ffe020 32%, #ffaa00 64%, #ff7800 100%)",
      animation: "sunRise 1.4s cubic-bezier(.22,1,.36,1) both, sunPulse 3.2s ease-in-out 1.4s infinite",
    }} />

    {/* Cloud 1 – large, slow drift */}
    <div style={{ position: "absolute", top: "22%", left: 0, animation: "cloudDrift1 26s linear 0.5s infinite" }}>
      <Cloud w={230} h={92} variant="light" />
    </div>

    {/* Cloud 2 – small, faster drift */}
    <div style={{ position: "absolute", top: "58%", left: 0, animation: "cloudDrift2 18s linear 10s infinite" }}>
      <Cloud w={150} h={60} variant="light" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   🌧  RAIN ANIMATION
   ══════════════════════════════════════════════ */
const RainAnimation = () => {
  const drops = Array.from({ length: 45 }, (_, i) => ({
    x:   `${2 + (i * 2.20) % 95}%`,
    dur: `${0.50 + (i % 6) * 0.09}s`,
    del: `${(i * 0.13) % 2.8}s`,
    h:   14 + (i % 6) * 6,
    op:  0.45 + (i % 4) * 0.14,
    w:   i % 4 === 0 ? 3 : 2,
  }));
  const splashes = Array.from({ length: 14 }, (_, i) => ({
    x:   `${4 + i * 7}%`,
    del: `${(i * 0.21) % 1.6}s`,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>

      {/* Dark overcast sky */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(10,22,38,.52) 0%, rgba(15,40,55,.22) 100%)",
      }} />

      {/* Full-width storm cloud bank */}
      <div style={{
        position: "absolute", top: 0, left: "50%",
        transform: "translateX(-50%)",
        animation: "cloudSway 5s ease-in-out infinite",
        width: 1000, minWidth: 1000,
      }}>
        <svg width="1000" height="128" viewBox="0 0 1000 128" fill="none">
          <ellipse cx="140"  cy="98"  rx="128" ry="30" fill="rgba(55,75,95,.96)" />
          <ellipse cx="104"  cy="76"  rx="78"  ry="52" fill="rgba(55,75,95,.96)" />
          <ellipse cx="178"  cy="68"  rx="64"  ry="44" fill="rgba(65,85,105,.90)" />
          <ellipse cx="136"  cy="55"  rx="50"  ry="36" fill="rgba(75,95,115,.85)" />

          <ellipse cx="500"  cy="102" rx="150" ry="28" fill="rgba(45,65,85,.96)" />
          <ellipse cx="458"  cy="78"  rx="84"  ry="54" fill="rgba(45,65,85,.96)" />
          <ellipse cx="542"  cy="70"  rx="70"  ry="46" fill="rgba(55,75,95,.90)" />
          <ellipse cx="498"  cy="57"  rx="58"  ry="37" fill="rgba(65,85,105,.85)" />

          <ellipse cx="866"  cy="100" rx="126" ry="28" fill="rgba(50,70,90,.96)" />
          <ellipse cx="834"  cy="77"  rx="76"  ry="50" fill="rgba(50,70,90,.96)" />
          <ellipse cx="898"  cy="69"  rx="66"  ry="42" fill="rgba(60,80,100,.90)" />
          <ellipse cx="864"  cy="56"  rx="52"  ry="33" fill="rgba(70,90,110,.85)" />

          <ellipse cx="326"  cy="105" rx="110" ry="24" fill="rgba(40,60,80,.92)" />
          <ellipse cx="688"  cy="103" rx="115" ry="24" fill="rgba(42,62,82,.92)" />
        </svg>
      </div>

      {/* Rain drops */}
      {drops.map((d, i) => (
        <div key={i} style={{
          position: "absolute", left: d.x, top: 0,
          width: d.w, height: d.h, borderRadius: 3,
          background: "linear-gradient(180deg, rgba(180,228,255,0) 0%, rgba(180,228,255,.95) 100%)",
          transform: "rotate(13deg)",
          opacity: d.op,
          animation: `rainDrop ${d.dur} linear ${d.del} infinite`,
        }} />
      ))}

      {/* Splash bursts */}
      {splashes.map((s, i) => (
        <div key={`sp${i}`} style={{
          position: "absolute", bottom: 10, left: s.x,
          width: 14, height: 5, borderRadius: "50%",
          border: "1.5px solid rgba(180,228,255,.68)",
          animation: `splash .78s ease-out ${s.del} infinite`,
        }} />
      ))}

      {/* Ripple rings */}
      {splashes.map((s, i) => (
        <div key={`rp${i}`} style={{
          position: "absolute", bottom: 7, left: s.x,
          width: 22, height: 4, borderRadius: "50%",
          border: "1px solid rgba(180,228,255,.38)",
          animation: `ripple 1.12s ease-out ${(parseFloat(s.del) + 0.35).toFixed(2)}s infinite`,
        }} />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════
   ⛈  THUNDERSTORM / CLOUDY ANIMATION
   ══════════════════════════════════════════════ */
const ThunderstormAnimation = () => (
  <div style={{
    position: "absolute", inset: 0, overflow: "hidden",
    pointerEvents: "none", zIndex: 4,
    animation: "thFlash 9s ease-in-out infinite",
  }}>
    {/* Dark sky overlay */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(8,18,30,.62) 0%, rgba(15,35,50,.28) 100%)",
    }} />

    {/* Back-right cloud */}
    <div style={{ position: "absolute", top: "-6%", right: "-3%",
      animation: "cfloat3 10s ease-in-out infinite", opacity: 0.65 }}>
      <Cloud w={310} h={115} variant="dark" />
    </div>

    {/* Mid-left cloud */}
    <div style={{ position: "absolute", top: "-2%", left: "-4%",
      animation: "cfloat1 7.5s ease-in-out infinite", opacity: 0.88 }}>
      <Cloud w={360} h={135} variant="dark" />
    </div>

    {/* Front centre cloud (biggest) */}
    <div style={{ position: "absolute", top: "10%", left: "22%",
      animation: "cfloat2 12s ease-in-out 1.5s infinite", opacity: 1 }}>
      <Cloud w={420} h={155} variant="dark" />
    </div>

    {/* Right overlay cloud */}
    <div style={{ position: "absolute", top: "7%", right: "4%",
      animation: "cfloat3 9s ease-in-out 2.5s infinite", opacity: 0.75 }}>
      <Cloud w={270} h={100} variant="dark" />
    </div>

    {/* ⚡ Main lightning bolt */}
    <div style={{
      position: "absolute", top: "44%", left: "41%",
      animation: "bolt1 9s ease-in-out infinite",
      filter: "drop-shadow(0 0 18px #ffe566) drop-shadow(0 0 6px #fff9c4)",
    }}>
      <svg width="44" height="96" viewBox="0 0 44 96">
        <polygon points="26,0 7,52 23,52 15,96 42,34 25,34 38,0" fill="#fff176" />
        <polygon points="26,0 7,52 23,52 15,96 42,34 25,34 38,0" fill="rgba(255,245,100,.50)" />
      </svg>
    </div>

    {/* ⚡ Secondary bolt – right */}
    <div style={{
      position: "absolute", top: "38%", right: "18%",
      animation: "bolt2 9s ease-in-out 0.6s infinite",
      filter: "drop-shadow(0 0 14px #ffe566)",
    }}>
      <svg width="26" height="60" viewBox="0 0 26 60">
        <polygon points="17,0 3,32 15,32 8,60 26,22 15,22 23,0" fill="#fff59d" />
      </svg>
    </div>

    {/* ⚡ Faint bolt – left */}
    <div style={{
      position: "absolute", top: "53%", left: "17%",
      animation: "bolt1 9s ease-in-out 1.6s infinite",
      filter: "drop-shadow(0 0 9px #ffe020)",
      opacity: 0.62,
    }}>
      <svg width="20" height="46" viewBox="0 0 20 46">
        <polygon points="13,0 2,25 11,25 6,46 20,16 12,16 17,0" fill="#fff9c4" />
      </svg>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   WEATHER TYPE → ANIMATION
   ══════════════════════════════════════════════ */
const getWeatherType = (code) => {
  if (code === 0)                                               return "sunny";
  if (code >= 1  && code <= 3)                                  return "cloudy";
  if (code >= 45 && code <= 48)                                 return "cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rainy";
  if (code >= 71 && code <= 77)                                 return "rainy";
  if (code >= 95)                                               return "storm";
  return "cloudy";
};

const WeatherAnimation = ({ code }) => {
  const type = getWeatherType(code);
  if (type === "sunny") return <SunnyAnimation />;
  if (type === "rainy") return <RainAnimation />;
  return <ThunderstormAnimation />;
};

/* ══════════════════════════════════════════════
   LOCALISATION
   ══════════════════════════════════════════════ */
const TEXT = {
  en: {
    title: "WEATHER INTELLIGENCE",
    irrigateYes: "Irrigation Recommended",
    irrigateNo: "Irrigation Not Required",
    irrigateYesDesc: "Low rainfall probability detected. Controlled irrigation is advised.",
    irrigateNoDesc: "Rainfall probability is high. Avoid irrigation to prevent waterlogging.",
    powered: "Powered by Open‑Meteo (free & open)",
  },
  ta: {
    title: "வானிலை அறிவு",
    irrigateYes: "நீர்ப்பாசனம் பரிந்துரை",
    irrigateNo: "நீர்ப்பாசனம் தேவையில்லை",
    irrigateYesDesc: "மழை வாய்ப்பு குறைவு. கட்டுப்படுத்தப்பட்ட நீர்ப்பாசனம் பரிந்துரைக்கப்படுகிறது.",
    irrigateNoDesc: "மழை வாய்ப்பு அதிகம். நீர் தேக்கம் தவிர்க்க நீர்ப்பாசனம் வேண்டாம்.",
    powered: "Open‑Meteo மூலம் இயக்கப்படுகிறது",
  },
  hi: {
    title: "मौसम जानकारी",
    irrigateYes: "सिंचाई की सलाह",
    irrigateNo: "सिंचाई की आवश्यकता नहीं",
    irrigateYesDesc: "वर्षा की संभावना कम है। नियंत्रित सिंचाई की सलाह दी जाती है।",
    irrigateNoDesc: "वर्षा की संभावना अधिक है। जलभराव से बचने के लिए सिंचाई न करें।",
    powered: "Open‑Meteo द्वारा संचालित",
  },
  ml: {
    title: "കാലാവസ്ഥ വിവരങ്ങൾ",
    irrigateYes: "നനവ് ശുപാർശ ചെയ്യുന്നു",
    irrigateNo: "നനവ് ആവശ്യമില്ല",
    irrigateYesDesc: "മഴ സാധ്യത കുറവാണ്. നിയന്ത്രിത നനവ് ശുപാർശ ചെയ്യുന്നു.",
    irrigateNoDesc: "മഴ സാധ്യത കൂടുതലാണ്. വെള്ളം കെട്ടിയൊഴുകുന്നത് ഒഴിവാക്കുക.",
    powered: "Open‑Meteo ഉപയോഗിച്ച്",
  },
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
const Weather = () => {
  const { language } = useApp();
  const t = TEXT[language] || TEXT.en;

  const [weather,      setWeather]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [locationName, setLocationName] = useState("Detecting location...");

  const reverseGeocode = async (lat, lon) => {
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      const city  = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Your Location";
      const state = data.address?.state || "";
      setLocationName(state ? `${city}, ${state}` : city);
    } catch {
      setLocationName("Your Location");
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          fetchWeather(coords.latitude, coords.longitude);
          reverseGeocode(coords.latitude, coords.longitude);
        },
        () => {
          setLocationName("New Delhi, India");
          fetchWeather(28.61, 77.20);
        }
      );
    } else {
      setLocationName("New Delhi, India");
      fetchWeather(28.61, 77.20);
    }
  }, []);

  const fetchWeather = async (lat, lon) => {
    try {
      const res  = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await res.json();
      setWeather(data);
      localStorage.setItem("agroot_rain", data.current.weather_code >= 51 && data.current.weather_code <= 67);
    } catch (e) {
      console.error("Weather fetch failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (code) => {
    if (code === 0)               return "☀️";
    if (code >= 1  && code <= 3)  return "⛅";
    if (code >= 45 && code <= 48) return "🌫";
    if (code >= 51 && code <= 67) return "🌧";
    if (code >= 71 && code <= 77) return "❄️";
    if (code >= 95)               return "⛈";
    return "🌡";
  };

  if (loading) return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-green-50 text-green-800">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4" />
        <p className="animate-pulse">Loading Forecast...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] w-full bg-green-50 text-gray-800 flex flex-col font-sans">

      {/* ══════════════════════════════════════════════
          UPPER GREEN HEADER BOX  ← animations live here
          ══════════════════════════════════════════════ */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-none bg-green-700 text-white rounded-b-[2.5rem] px-6 md:px-16 py-8 shadow-xl"
        style={{ position: "relative", overflow: "hidden", minHeight: 280 }}
      >
        {/* Soft ambient glow blob */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: 260, height: 260, borderRadius: "50%",
          background: "rgba(255,255,255,.08)", filter: "blur(60px)",
          transform: "translate(50%,-50%)", pointerEvents: "none",
        }} />

        {/* ★★★  LIVE WEATHER ANIMATION  ★★★ */}
        {weather && <WeatherAnimation code={weather.current.weather_code} />}

        {/* Nav – z-index 10, sits above animation */}
        <div style={{ position: "relative", zIndex: 10 }}
          className="flex items-center justify-between mb-8">
          <button
            onClick={() => window.history.back()}
            className="p-2 -ml-2 rounded-full hover:bg-white/15 transition-colors backdrop-blur-sm"
          >
            ← Back
          </button>
          <div className="text-right">
            <h1 className="text-2xl font-bold drop-shadow-md">{t.title}</h1>
            <p className="text-sm text-green-100 flex items-center justify-end gap-1">
              <span>📍</span>{locationName}
            </p>
            <p className="text-xs text-green-200 opacity-70">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Weather data card – z-index 10 */}
        {weather && (
          <div style={{ position: "relative", zIndex: 10 }}
            className="flex flex-col md:flex-row items-center justify-between gap-8">

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center md:text-left"
            >
              <div className="text-8xl md:text-9xl mb-2 drop-shadow-xl select-none">
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
                    <p className="text-5xl md:text-6xl font-bold">
                      {Math.round(weather.current.temperature_2m)}°C
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm uppercase tracking-wider mb-1">Wind</p>
                    <p className="text-xl md:text-2xl font-semibold">
                      {weather.current.wind_speed_10m} km/h
                    </p>
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

      {/* ══════════════════════════════════
          7-DAY FORECAST
          ══════════════════════════════════ */}
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
              transition={{ delay: 0.08 * i }}
              className="bg-white border border-green-100 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow group"
            >
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {new Date(day).toLocaleDateString(undefined, {
                    weekday: "short", month: "short", day: "numeric",
                  })}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-800">
                    {Math.round(weather.daily.temperature_2m_max[i])}°
                  </span>
                  <span className="text-sm text-gray-400">
                    / {Math.round(weather.daily.temperature_2m_min[i])}°
                  </span>
                </div>
              </div>
              <div className="text-3xl group-hover:scale-110 transition-transform select-none">
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