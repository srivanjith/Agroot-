import { useState, useEffect } from "react";
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

/* ── Alert severity config ── */
const SEVERITY = {
  critical: { bg: "bg-red-50",    ring: "ring-red-200",    dot: "bg-red-500",    label: "Critical",  labelCls: "text-red-600 bg-red-100" },
  warning:  { bg: "bg-amber-50",  ring: "ring-amber-200",  dot: "bg-amber-500",  label: "Warning",   labelCls: "text-amber-700 bg-amber-100" },
  info:     { bg: "bg-blue-50",   ring: "ring-blue-200",   dot: "bg-blue-500",   label: "Info",      labelCls: "text-blue-700 bg-blue-100" },
  success:  { bg: "bg-emerald-50",ring: "ring-emerald-200",dot: "bg-emerald-500",label: "Good",      labelCls: "text-emerald-700 bg-emerald-100" },
};

/* ── Generate alerts based on temperature + field data ── */
const buildAlerts = (temp, fields) => {
  const now    = new Date();
  const hour   = now.getHours();
  const alerts = [];

  /* ── Climate alerts ── */
  if (temp !== null) {
    if (temp >= 42) {
      alerts.push({ id: "heat-extreme", type: "climate", severity: "critical", icon: "🔥",
        title: "Extreme Heat Warning", body: `Current temperature is ${temp}°C. Crops may experience severe heat stress. Irrigate immediately and apply mulching.`, time: "Now" });
    } else if (temp >= 36) {
      alerts.push({ id: "heat-high", type: "climate", severity: "warning", icon: "☀️",
        title: "High Temperature Alert", body: `Temperature is ${temp}°C — above optimal range. Consider evening irrigation to reduce crop stress.`, time: "Now" });
    } else if (temp <= 8) {
      alerts.push({ id: "frost", type: "climate", severity: "critical", icon: "🧊",
        title: "Frost Risk Alert", body: `Temperature has dropped to ${temp}°C. Cover sensitive crops and avoid irrigation to prevent frost damage.`, time: "Now" });
    } else if (temp <= 15) {
      alerts.push({ id: "cold", type: "climate", severity: "warning", icon: "❄️",
        title: "Cold Weather Alert", body: `Temperature is ${temp}°C. Monitor heat-sensitive crops and reduce irrigation frequency.`, time: "Now" });
    } else {
      alerts.push({ id: "temp-ok", type: "climate", severity: "success", icon: "🌤️",
        title: "Climate Conditions Normal", body: `Temperature is ${temp}°C — within the optimal growing range for most crops. No action needed.`, time: "Now" });
    }
  }

  /* ── Irrigation reminders based on field data ── */
  fields.forEach(field => {
    const timeStr  = field.nextIrrigation || "";
    const isToday  = timeStr.toLowerCase().startsWith("today");
    const isMissed = (() => {
      if (!isToday) return false;
      const match = timeStr.match(/(\d{1,2}):(\d{2})/);
      if (!match) return false;
      const schedHour = parseInt(match[1], 10);
      return hour > schedHour;
    })();

    if (isMissed) {
      alerts.push({
        id:       `irrig-missed-${field.id}`,
        type:     "irrigation",
        severity: "critical",
        icon:     "💧",
        title:    `Missed Irrigation — ${field.cropName}`,
        body:     `Scheduled irrigation for ${field.cropName} at ${timeStr.replace("Today • ","")} was missed. Irrigate as soon as possible to prevent moisture stress.`,
        time:     "Overdue",
      });
    } else if (isToday) {
      alerts.push({
        id:       `irrig-due-${field.id}`,
        type:     "irrigation",
        severity: "warning",
        icon:     "🚿",
        title:    `Irrigation Due — ${field.cropName}`,
        body:     `${field.cropName} is scheduled for irrigation ${timeStr}. Make sure your water supply is ready.`,
        time:     timeStr.replace("Today • ",""),
      });
    } else {
      alerts.push({
        id:       `irrig-sched-${field.id}`,
        type:     "irrigation",
        severity: "info",
        icon:     "📅",
        title:    `Upcoming Irrigation — ${field.cropName}`,
        body:     `Next irrigation for ${field.cropName} is ${timeStr}. Current moisture: ${field.moisture}.`,
        time:     timeStr,
      });
    }
  });

  /* ── Humidity / rain tip ── */
  if (temp !== null && temp >= 30 && alerts.filter(a => a.type === "irrigation").length === 0) {
    alerts.push({ id: "humidity-tip", type: "tip", severity: "info", icon: "💦",
      title: "Irrigation Reminder", body: "No irrigation schedule found for your fields. With current temperatures, ensure fields are irrigated every 48–72 hours.", time: "Tip" });
  }

  return alerts;
};

/* ═══════════════════════════════════════ */
const AlertsPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [temp,       setTemp]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [dismissed,  setDismissed]  = useState(() => {
    try { return JSON.parse(localStorage.getItem("agroot_dismissed_alerts") || "[]"); } catch { return []; }
  });
  const [filter, setFilter] = useState("all");

  /* Load fields from localStorage */
  const fields = (() => {
    try { return JSON.parse(localStorage.getItem("agroot_fields_list") || "[]"); } catch { return []; }
  })();

  /* Fetch current temperature */
  useEffect(() => {
    if (!navigator.geolocation) { setLoading(false); return; }
    const timeout = setTimeout(() => setLoading(false), 5000);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res  = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`, { signal: AbortSignal.timeout(3000) });
          const data = await res.json();
          if (data?.current?.temperature_2m !== undefined) setTemp(Math.round(data.current.temperature_2m));
        } catch { /* use null */ }
        clearTimeout(timeout);
        setLoading(false);
      },
      () => { clearTimeout(timeout); setLoading(false); },
      { enableHighAccuracy: false, timeout: 4000 }
    );
  }, []);

  const allAlerts   = buildAlerts(temp, fields);
  const activeAlerts = allAlerts.filter(a => !dismissed.includes(a.id));
  const shown       = filter === "all" ? activeAlerts : activeAlerts.filter(a => a.type === filter || a.severity === filter);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("agroot_dismissed_alerts", JSON.stringify(next));
  };

  const clearAll = () => {
    const next = allAlerts.map(a => a.id);
    setDismissed(next);
    localStorage.setItem("agroot_dismissed_alerts", JSON.stringify(next));
  };

  const sidebarItems = [
    { label: "Dashboard",    path: "/home" },
    { label: "Fields",       path: "/satellite" },
    { label: "Crops",        path: "/seeds" },
    { label: "Crop Tracker", path: "/costs" },
    { label: "Rentals",      path: "/rental" },
    { label: "Alerts",       active: true },
    { label: "Reports",      path: "/profile" },
    { label: "Profile",      path: "/profile" },
  ];

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
              <span className="font-extrabold text-[12px] tracking-[0.18em] text-emerald-950 uppercase mt-1">AGROOT</span>
            </div>
            {/* Nav */}
            <nav className="space-y-1.5 mt-5">
              {sidebarItems.map(item => {
                const isActive = !!item.active;
                return (
                  <button key={item.label} onClick={() => item.path && navigate(item.path)}
                    className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[12px] font-extrabold tracking-wide transition-all duration-300 ${
                      isActive ? "bg-emerald-50 text-emerald-900 border border-emerald-500/10 shadow-sm" : "text-gray-400 hover:text-emerald-950 hover:bg-gray-50/50"
                    }`}>
                    <span className={`shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400"}`}>{renderSidebarIcon(item.label)}</span>
                    <span>{t(`sidebar.${item.label.toLowerCase().replace(/\s+/g, "")}`, item.label)}</span>
                    {item.label === "Alerts" && activeAlerts.length > 0 && (
                      <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                        {activeAlerts.length}
                      </span>
                    )}
                  </button>
                );
              })}
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
        <main className="p-5 lg:p-8 space-y-6 pb-16 max-w-3xl mx-auto w-full">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-[#EFEBE3]/60 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-emerald-950">🔔 {t("sidebar.alerts", "Alerts")}</h1>
              <p className="text-xs text-gray-400 font-bold mt-1">
                Smart notifications for your farm — irrigation, climate &amp; more
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Live temp badge */}
              {loading ? (
                <div className="h-8 w-24 rounded-full bg-gray-100 animate-pulse"/>
              ) : temp !== null ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white ring-1 ring-black/[0.06] text-[11px] font-black text-emerald-900 shadow-sm">
                  🌡️ {temp}°C live
                </div>
              ) : null}
              {activeAlerts.length > 0 && (
                <button onClick={clearAll}
                  className="text-[10px] font-black text-gray-400 hover:text-red-500 transition-colors cursor-pointer px-3 py-1.5 rounded-full border border-[#EFEBE3] hover:border-red-200">
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: "all",        label: "All" },
              { key: "critical",   label: "🔴 Critical" },
              { key: "warning",    label: "🟡 Warning" },
              { key: "irrigation", label: "💧 Irrigation" },
              { key: "climate",    label: "🌤️ Climate" },
              { key: "info",       label: "ℹ️ Info" },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                  filter === f.key ? "bg-[#1B4332] text-white shadow-sm" : "bg-[#F0F4F1] text-[#4A7A5A] border border-[#D6E4DA] hover:bg-white"
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Alert Cards */}
          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="h-24 rounded-3xl bg-white/60 ring-1 ring-black/[0.05] animate-pulse"/>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {shown.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-24 bg-white/60 rounded-3xl ring-1 ring-black/[0.06]">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="font-black text-emerald-950 text-sm">All clear!</p>
                  <p className="text-gray-400 text-xs font-semibold mt-1">No active alerts for your farm right now.</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {shown.map((alert, i) => {
                    const sev = SEVERITY[alert.severity] || SEVERITY.info;
                    return (
                      <motion.div key={alert.id}
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
                        transition={{ delay: i * 0.05 }}
                        className={`relative rounded-3xl p-5 ring-1 ${sev.bg} ${sev.ring} flex items-start gap-4`}>

                        {/* Severity dot pulse */}
                        <div className="relative mt-0.5 shrink-0">
                          <div className={`w-2.5 h-2.5 rounded-full ${sev.dot}`}/>
                          {(alert.severity === "critical" || alert.severity === "warning") && (
                            <motion.div animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                              transition={{ repeat: Infinity, duration: 1.6, ease: "easeOut" }}
                              className={`absolute inset-0 rounded-full ${sev.dot} opacity-60`}/>
                          )}
                        </div>

                        {/* Icon + content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-lg leading-none">{alert.icon}</span>
                            <p className="font-black text-sm text-[#1B3A2D]">{alert.title}</p>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${sev.labelCls}`}>
                              {sev.label}
                            </span>
                            <span className="text-[9px] text-gray-400 font-bold ml-auto">{alert.time}</span>
                          </div>
                          <p className="text-xs text-gray-500 font-semibold leading-relaxed">{alert.body}</p>
                        </div>

                        {/* Dismiss */}
                        <button onClick={() => dismiss(alert.id)}
                          className="shrink-0 w-7 h-7 rounded-full hover:bg-black/5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer text-xs">
                          ✕
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </AnimatePresence>
          )}

          {/* Footer note */}
          <p className="text-center text-[10px] text-gray-400 font-bold pt-2">
            Alerts are generated based on your live location weather &amp; field schedules.
          </p>
        </main>
      </div>
    </div>
  );
};

export default AlertsPage;
