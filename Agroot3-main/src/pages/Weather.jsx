import "./weather-animations.css";
import { useApp } from "../context/AppContext";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ── Sidebar icons helper ── */
const renderSidebarIcon = (label) => {
  switch (label) {
    case "Dashboard": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>);
    case "Fields": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
      </svg>);
    case "Crops": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.5 8.5.3.2.7.2 1-.1L19.7 8.2c.3-.3.3-.7.1-1C17.6 3.8 14.5 2 12 2z"/>
        <path d="M12 2v20M2 12h20" strokeDasharray="1.5 1.5"/>
      </svg>);
    case "Crop Tracker": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>);
    case "Rentals": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>);
    case "Alerts": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>);
    case "Reports": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>);
    case "Profile": return (
      <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>);
    default: return null;
  }
};

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
   `⛅`  PARTLY CLOUDY ANIMATION
   ══════════════════════════════════════════════ */
const PartlyCloudyAnimation = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>
    {/* Blue-gold sky tint */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(165deg, rgba(135,206,235,.25) 0%, rgba(255,223,128,.15) 50%, rgba(0,120,60,.04) 100%)",
    }} />
    {/* Gentle sun disc */}
    <div style={{
      position: "absolute",
      left: "25%", top: "72%",
      width: 80, height: 80,
      borderRadius: "50%",
      background: "radial-gradient(circle at 40% 36%, #ffffff 0%, #ffeb3b 40%, #ff9800 100%)",
      boxShadow: "0 0 40px 15px rgba(255, 235, 59, 0.4)",
      animation: "sunRise 1.4s cubic-bezier(.22,1,.36,1) both",
    }} />
    {/* Drifting Clouds */}
    <div style={{ position: "absolute", top: "25%", left: 0, animation: "cloudDrift1 28s linear infinite" }}>
      <Cloud w={190} h={76} variant="light" />
    </div>
    <div style={{ position: "absolute", top: "52%", left: 0, animation: "cloudDrift2 22s linear 6s infinite" }}>
      <Cloud w={130} h={52} variant="light" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   ☁️  OVERCAST CLOUDY ANIMATION
   ══════════════════════════════════════════════ */
const CloudyAnimation = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>
    {/* Overcast sky gradient */}
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(180deg, rgba(160,180,195,.4) 0%, rgba(130,150,165,.2) 100%)",
    }} />
    {/* Drifting Clouds */}
    <div style={{ position: "absolute", top: "15%", left: "-50px", animation: "cfloat1 12s ease-in-out infinite", opacity: 0.85 }}>
      <Cloud w={240} h={96} variant="dark" />
    </div>
    <div style={{ position: "absolute", top: "40%", left: "30%", animation: "cfloat2 14s ease-in-out infinite", opacity: 0.9 }}>
      <Cloud w={200} h={80} variant="light" />
    </div>
    <div style={{ position: "absolute", top: "20%", right: "-30px", animation: "cfloat3 10s ease-in-out infinite", opacity: 0.75 }}>
      <Cloud w={170} h={68} variant="dark" />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   ❄️  SNOW ANIMATION
   ══════════════════════════════════════════════ */
const SnowAnimation = () => {
  const flakes = Array.from({ length: 30 }, (_, i) => ({
    x:   `${2 + (i * 3.3) % 95}%`,
    dur: `${2.5 + (i % 5) * 0.8}s`,
    del: `${(i * 0.22) % 3.5}s`,
    size: 4 + (i % 4) * 2,
    op:  0.5 + (i % 4) * 0.12,
  }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 4 }}>
      {/* Cold winter sky */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(20,35,55,.45) 0%, rgba(45,65,85,.25) 100%)",
      }} />
      {/* Soft cloud bank */}
      <div style={{ position: "absolute", top: "-10px", left: "10%", opacity: 0.7 }}>
        <Cloud w={300} h={100} variant="light" />
      </div>
      {/* Falling snowflakes */}
      {flakes.map((f, i) => (
        <div key={i} style={{
          position: "absolute", left: f.x, top: -10,
          width: f.size, height: f.size, borderRadius: "50%",
          background: "#ffffff",
          opacity: f.op,
          filter: "blur(0.3px)",
          animation: `snowDrop ${f.dur} linear ${f.del} infinite`,
        }} />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════
   WEATHER TYPE → ANIMATION
   ══════════════════════════════════════════════ */
const getWeatherType = (code, temp) => {
  if (code >= 95)                                               return "storm";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rainy";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snowy";
  
  // If temperature is high (>= 28°C), force sunny animation if not storming or raining
  if (temp >= 28) {
    return "sunny";
  }

  if (code === 1 || code === 2)                                 return "partly-cloudy";
  if (code === 3 || (code >= 45 && code <= 48))                 return "cloudy";
  if (code === 0)                                               return "sunny";

  if (temp >= 24) return "sunny";
  if (temp >= 15) return "partly-cloudy";
  return "cloudy";
};

const WeatherAnimation = ({ code, temp }) => {
  const type = getWeatherType(code, temp);
  if (type === "sunny")         return <SunnyAnimation />;
  if (type === "partly-cloudy") return <PartlyCloudyAnimation />;
  if (type === "cloudy")        return <CloudyAnimation />;
  if (type === "rainy")         return <RainAnimation />;
  if (type === "snowy")         return <SnowAnimation />;
  return <ThunderstormAnimation />;
};

/* ══════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════ */
const Weather = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { language } = useApp();

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

  const sidebarItems = [
    { label: "Dashboard",    path: "/home" },
    { label: "Fields",       path: "/satellite" },
    { label: "Crops",        path: "/seeds" },
    { label: "Crop Tracker", path: "/costs" },
    { label: "Rentals",      path: "/rental" },
    { label: "Alerts",       path: "/alerts" },
    { label: "Reports",      path: "/profile" },
    { label: "Profile",      path: "/profile" }
  ];

  if (loading) return (
    <div className="min-h-screen w-full font-sans flex bg-[#F8F9FA] text-[#1A2E1A] overflow-hidden">
      <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-white border-r border-[#EFEBE3] p-4 shrink-0 z-20 select-none">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-[#EFEBE3]/60 w-full gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/50 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 21V10" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 14c1.5-1 2.5-2.5 2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 17c-1.5-1-2.5-2.5-2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-955 uppercase mt-1">AGROOT</span>
            </div>
            <nav className="space-y-1.5 mt-5">
              {sidebarItems.map(item => (
                <button key={item.label} onClick={() => item.path && navigate(item.path)}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50">
                  <span className="shrink-0 text-gray-400">{renderSidebarIcon(item.label)}</span>
                  <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center py-2">v1.2.0</div>
        </div>
      </aside>
      <div className="flex-1 flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <p className="text-sm font-bold text-emerald-900 animate-pulse">Loading Forecast...</p>
        </div>
      </div>
    </div>
  );

  const isRainy = weather ? (weather.current.weather_code >= 51 && weather.current.weather_code <= 67) : false;

  return (
    <div className="min-h-screen w-full font-sans flex bg-[#F8F9FA] text-[#1A2E1A] overflow-hidden">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-[220px] h-screen bg-white border-r border-[#EFEBE3] p-4 shrink-0 z-20 select-none">
        <div className="flex flex-col h-full justify-between">
          <div>
            {/* Logo */}
            <div className="flex flex-col items-center justify-center pt-2 pb-6 border-b border-[#EFEBE3]/60 w-full gap-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50/50 border border-emerald-500/10 flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none">
                  <path d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z" fill="#10B981" fillOpacity="0.25" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 21V10" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 14c1.5-1 2.5-2.5 2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                  <path d="M12 17c-1.5-1-2.5-2.5-2.5-4" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-955 uppercase mt-1">AGROOT</span>
            </div>
            {/* Nav */}
            <nav className="space-y-1.5 mt-5">
              {sidebarItems.map(item => (
                <button key={item.label} onClick={() => item.path && navigate(item.path)}
                  className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50">
                  <span className="shrink-0 text-gray-400">{renderSidebarIcon(item.label)}</span>
                  <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                </button>
              ))}
            </nav>
          </div>
          {/* AGROOT AI dock */}
          <div className="mt-auto border-t border-[#EFEBE3]/60 pt-4 pb-2 flex flex-col items-center gap-3">
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => navigate("/chat")}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-full bg-emerald-800 text-white text-[10px] font-extrabold tracking-[0.14em] shadow-md shadow-emerald-900/20 cursor-pointer border border-emerald-700/40">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.5 4.5-5 8.5-5 11 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.5-.5-6.5-5-11z"/>
              </svg>
              AGROOT AI +
            </motion.button>
            <div className="relative flex items-center justify-center">
              <motion.div animate={{ scale: [1, 1.5], opacity: [0.4, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                className="absolute inset-0 rounded-full border border-emerald-500 pointer-events-none"/>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }} onClick={() => navigate("/chat")}
                className="w-12 h-12 rounded-full bg-emerald-800 flex items-center justify-center shadow-lg shadow-emerald-900/25 border border-emerald-600/30 cursor-pointer">
                <div className="flex items-center gap-[2.5px] h-4">
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 5 }} animate={{ height: [5,14,5] }} transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}/>
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 12 }} animate={{ height: [12,6,12] }} transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}/>
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 9 }} animate={{ height: [9,18,9] }} transition={{ repeat: Infinity, duration: 1.3, ease: "easeInOut" }}/>
                  <motion.div className="w-[2.5px] bg-white rounded-full" style={{ height: 6 }} animate={{ height: [6,11,6] }} transition={{ repeat: Infinity, duration: 1.0, ease: "easeInOut" }}/>
                </div>
              </motion.button>
            </div>
            <span className="text-[9px] text-gray-400 font-bold tracking-wider uppercase">v1.2.0</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 h-screen overflow-y-auto z-10 relative">
        <main className="p-5 lg:p-8 max-w-5xl mx-auto w-full space-y-6 pb-16">
          
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-[#EFEBE3]/60 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-955">🌦️ {t("weather.title", "Weather Intelligence")}</h1>
              <p className="text-xs text-gray-400 font-bold mt-1">{t("weather.subtitle", "Climate-driven farming decisions")}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white ring-1 ring-black/[0.06] text-[10px] font-black text-emerald-900 shadow-sm">
                📍 {locationName}
              </div>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                onClick={() => navigate("/home")}
                className="flex items-center gap-1 px-4 py-2 rounded-full text-[10px] font-black text-emerald-800 border border-emerald-200 hover:bg-emerald-50 transition-all cursor-pointer bg-white">
                ← Dashboard
              </motion.button>
            </div>
          </div>

          {/* Current Weather Card with Live Animation */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-[2rem] min-h-[300px] bg-gradient-to-br from-emerald-800 to-emerald-900 text-white relative overflow-hidden shadow-md border border-emerald-700/20 p-6 md:p-8 flex flex-col justify-between">
            
            {/* Live Animation Container */}
            <div className="absolute inset-0 z-0 pointer-events-none select-none">
              {weather && <WeatherAnimation code={weather.current.weather_code} temp={Math.round(weather.current.temperature_2m)} />}
            </div>

            {/* Content overlaid on top of animation */}
            <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-stretch gap-6 h-full mt-2">
              {/* Left Column: Temperature and Location */}
              <div className="flex flex-col justify-between text-left">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200/70">{t("weather.current", "Current Conditions")}</span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-6xl md:text-7xl font-black tracking-tighter drop-shadow-md">
                      {Math.round(weather.current.temperature_2m)}°C
                    </span>
                    <span className="text-3xl select-none drop-shadow-md">{getWeatherIcon(weather.current.weather_code)}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-xs text-emerald-100 font-bold opacity-80">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p className="text-[10px] text-emerald-300 font-black mt-1 uppercase tracking-wider">{t("weather.powered", "Powered by Open‑Meteo")}</p>
                </div>
              </div>

              {/* Right Column: Parameters Dashboard */}
              <div className="flex-1 max-w-md w-full flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  
                  {/* Humidity */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-200/80 font-bold">Humidity</span>
                    <span className="text-xl font-black">{weather.current.relative_humidity_2m}%</span>
                  </div>

                  {/* Wind Speed */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col justify-between gap-1 shadow-sm">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-200/80 font-bold">Wind</span>
                    <span className="text-xl font-black">{weather.current.wind_speed_10m} km/h</span>
                  </div>

                  {/* Precipitation */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col justify-between gap-1 shadow-sm col-span-2">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-200/80 font-bold">Precipitation</span>
                    <span className="text-xl font-black">{isRainy ? "Rainfall Active" : "0% (Stable)"}</span>
                  </div>

                </div>
              </div>
            </div>

          </motion.div>

          {/* Agricultural Advisory Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className={`rounded-3xl p-6 ring-1 flex flex-col md:flex-row gap-5 items-start justify-between shadow-sm border ${
              isRainy 
                ? "bg-blue-50/70 border-blue-200 text-blue-900 ring-blue-100" 
                : "bg-emerald-50/40 border-emerald-500/10 text-emerald-950 ring-emerald-50/20"
            }`}
            style={{ backdropFilter: "blur(12px)" }}>
            
            <div className="flex gap-4 items-start">
              <span className="text-3xl shrink-0 mt-0.5">{isRainy ? "🌧️" : "🌾"}</span>
              <div className="space-y-1">
                <h3 className="font-black text-base">
                  {isRainy ? t("weather.irrigateNo", "Irrigation Not Required") : t("weather.irrigateYes", "Irrigation Recommended")}
                </h3>
                <p className="text-xs opacity-75 font-semibold leading-relaxed">
                  {isRainy ? t("weather.irrigateNoDesc") : t("weather.irrigateYesDesc")}
                </p>
              </div>
            </div>
            
            <span className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shrink-0 border mt-1 ${
              isRainy 
                ? "bg-blue-100/50 border-blue-300/40 text-blue-800" 
                : "bg-emerald-100/30 border-emerald-500/20 text-emerald-800"
            }`}>
              {t("weather.advisory", "Farming Advisory")}
            </span>
          </motion.div>

          {/* 7-Day Forecast Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-emerald-950 uppercase tracking-widest flex items-center gap-2">
              <span>📅</span> 7-Day Forecast
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {weather && weather.daily.time.map((day, i) => (
                <motion.div key={day}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white/70 backdrop-blur-xl ring-1 ring-black/[0.06] rounded-3xl p-5 flex flex-col justify-between items-center text-center shadow-sm hover:scale-[1.03] hover:shadow-md transition-all group border border-transparent hover:border-emerald-500/10">
                  
                  <span className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wide">
                    {new Date(day).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                  
                  <span className="text-4xl my-4 select-none group-hover:scale-110 transition-transform duration-300">
                    {getWeatherIcon(weather.daily.weather_code[i])}
                  </span>

                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-sm font-black text-emerald-950">{Math.round(weather.daily.temperature_2m_max[i])}°</span>
                    <span className="text-[10px] text-gray-400 font-bold">/ {Math.round(weather.daily.temperature_2m_min[i])}°</span>
                  </div>

                </motion.div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Weather;