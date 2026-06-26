import { useState, useEffect, useRef } from "react";
import { sendOTP, verifyOTP } from "../firebase/otp";
import { createOrGetUser } from "../firebase/user";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "../context/AppContext";

// Helper for generating random particles on input focus
const generateParticles = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 120 - 60, 
    y: Math.random() * -120 - 30, 
    duration: Math.random() * 1.2 + 0.8,
    delay: Math.random() * 0.15,
    size: Math.random() * 5 + 3,
    rotation: Math.random() * 360,
  }));
};

const slides = [
  {
    id: 0,
    title: "Harvest at the Perfect Moment",
    subtitle: "Smart Weather Telemetry",
    desc: "Hyper-local weather telemetry and smart alerts. Shield your crops from unexpected downpours or dry spells with AI-driven calendar updates.",
    metric: "98.4% Prediction Accuracy",
    icon: "🌦️",
    type: "weather"
  },
  {
    id: 1,
    title: "Rent Advanced Farming Gear",
    subtitle: "Equipment Rental Hub",
    desc: "Connect with local providers to rent high-grade tractors, soil tilters, and harvesting equipment at day rates. Zero broker fees.",
    metric: "3,200+ Active Implements",
    icon: "🚜",
    type: "rental"
  },
  {
    id: 2,
    title: "Listen to Your Soil's Needs",
    subtitle: "AI Soil Diagnostics",
    desc: "Input pH, nitrogen, and moisture levels to receive custom fertilizer recommendations and conditioning strategies customized for your region.",
    metric: "12K+ Diagnostics Conducted",
    icon: "🔬",
    type: "soil"
  },
  {
    id: 3,
    title: "Source Certified Quality Seeds",
    subtitle: "Seed & Crop Marketplace",
    desc: "Browse vetted high-yield seeds from registered nurseries. Filter by climate suitability, germination rate, and resistance ratings.",
    metric: "4.9★ Vetted Nurseries",
    icon: "🌾",
    type: "seeds"
  }
];

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
];

// Carousel Graphic Components
const WeatherGraphic = () => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-zinc-900/30 rounded-3xl border border-zinc-800/80 overflow-hidden shadow-inner">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-10 right-10 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 blur-[1px] shadow-[0_0_15px_rgba(251,191,36,0.3)]"
    />
    <motion.div
      animate={{ x: [-6, 6, -6] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-16 left-12 w-24 h-11 bg-zinc-800/40 backdrop-blur-md rounded-full border border-zinc-700/40 shadow-sm"
    >
      <div className="absolute -top-3 left-4 w-9 h-9 bg-zinc-800/20 rounded-full" />
      <div className="absolute -top-5 left-10 w-11 h-11 bg-zinc-800/20 rounded-full" />
    </motion.div>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="absolute w-0.5 h-3 bg-sky-300/40 rounded-full"
        style={{ left: `${35 + i * 18}%`, top: '62%' }}
        animate={{ y: [0, 18], opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45, ease: "linear" }}
      />
    ))}
  </div>
);

const RentalGraphic = () => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-zinc-900/30 rounded-3xl border border-zinc-800/80 overflow-hidden shadow-inner">
    <motion.svg
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="w-14 h-14 text-emerald-500/15 absolute left-12 top-10"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </motion.svg>
    <motion.svg
      animate={{ rotate: -360 }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="w-10 h-10 text-emerald-400/10 absolute right-14 bottom-12"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
    </motion.svg>
    <motion.div
      animate={{ y: [-4, 4, -4] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-28 h-20 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl flex flex-col justify-center px-3 shadow-lg backdrop-blur-md"
    >
      <span className="text-2xl">🚜</span>
      <div className="h-1.5 w-16 bg-white/20 rounded mt-2" />
      <div className="h-1 w-10 bg-white/10 rounded mt-1" />
    </motion.div>
  </div>
);

const SoilGraphic = () => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-zinc-900/30 rounded-3xl border border-zinc-800/80 overflow-hidden shadow-inner">
    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px]" />
    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-1.5 h-10">
      {[40, 75, 50, 90, 60].map((h, i) => (
        <motion.div
          key={i}
          className="w-4 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm"
          initial={{ height: 0 }}
          animate={{ height: `${h}%` }}
          transition={{ duration: 1.5, delay: i * 0.1, repeat: Infinity, repeatType: "reverse", repeatDelay: 1 }}
        />
      ))}
    </div>
    <div className="absolute top-10 flex flex-col items-center">
      <span className="text-3xl filter drop-shadow-md">🍃</span>
      <motion.div
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-0.5 bg-emerald-400/70 shadow-[0_0_8px_#34d399]"
      />
    </div>
  </div>
);

const SeedsGraphic = () => (
  <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-zinc-900/30 rounded-3xl border border-zinc-800/80 overflow-hidden shadow-inner">
    <div className="absolute w-24 h-24 rounded-full border border-dashed border-white/5 animate-[spin_25s_linear_infinite]" />
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl filter drop-shadow-lg"
      >
        🌱
      </motion.div>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-amber-400/70 blur-[0.5px]"
          style={{ width: `${Math.random() * 3 + 2}px`, height: `${Math.random() * 3 + 2}px`, bottom: '25%' }}
          animate={{ y: [0, -35], x: [0, (i - 1) * 12, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("phone"); 
  const [debugLogs, setDebugLogs] = useState(["Ready..."]);
  
  // Animation & UI States
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [particles, setParticles] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Custom states for premium dark mode
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isInside, setIsInside] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showConsole, setShowConsole] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [confetti, setConfetti] = useState([]);
  
  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);

  // Load language from AppContext
  const { language, setLanguage } = useApp();

  const navigate = useNavigate();

  const addLog = (msg) => setDebugLogs((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  // Network connection test
  const checkConnection = async () => {
    addLog("Testing Internet...");
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos/1", { cache: "no-store" });
      if (res.ok) addLog("Internet Check: OK");
      else addLog(`Internet Check: Failed (${res.status})`);
    } catch (e) {
      addLog(`Internet Check: ERROR (${e.message})`);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  // Quick Language selection
  const handleSelectLanguage = (code) => {
    setLanguage(code);
    addLog(`Language selected inside card: ${code}`);
  };

  // Carousel slide timer
  useEffect(() => {
    if (isSuccess) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isSuccess]);

  // Ambient mouse track listener
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseEnter = () => setIsInside(true);
    const handleMouseLeave = () => setIsInside(false);

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseenter", handleMouseEnter);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Generate particle burst when input is focused
  useEffect(() => {
    if (focusedInput) {
      setParticles(generateParticles(10));
      const timer = setTimeout(() => setParticles([]), 1500);
      return () => clearTimeout(timer);
    }
  }, [focusedInput]);

  // Confetti generator on success
  useEffect(() => {
    if (isSuccess) {
      const sparkles = Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        x: 0,
        y: 0,
        targetX: Math.random() * 300 - 150,
        targetY: Math.random() * -300 - 100,
        size: Math.random() * 10 + 6,
        color: Math.random() > 0.5 ? "#10B981" : "#F5D061", // emerald / gold
        rotation: Math.random() * 720,
        delay: Math.random() * 0.15,
      }));
      setConfetti(sparkles);
    }
  }, [isSuccess]);

  const triggerError = (msg) => {
    setIsError(true);
    addLog(`Error: ${msg}`);
    setTimeout(() => setIsError(false), 600);
  };

  const handleSendOTP = async () => {
    if (loading) return;
    addLog("Send OTP Clicked");
    try {
      if (!email || phone.length !== 10) {
        triggerError("Invalid credentials");
        return;
      }
      setLoading(true);
      checkConnection();
      await sendOTP(email, addLog);
      setStep("otp");
    } catch (err) {
      triggerError("Failed to send OTP");
      console.error("SEND OTP ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (loading) return;
    addLog("Verify OTP Clicked");
    try {
      setLoading(true);
      const result = await verifyOTP(email, otp.join(""), addLog);
      if (!result.success) {
        triggerError(result.message || "Verification failed");
        return;
      }
      
      try {
        await createOrGetUser({ email: `${phone}@agroot.local`, phone });
        
        // Save user to MySQL backend (optional dev server)
        fetch("http://localhost:5000/saveUser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            uid: email,
            email: email,
            language: language 
          })
        }).catch(err => console.error("MySQL Save Error:", err));

      } catch (userErr) {
        addLog(`User Creation Failed: ${userErr.message}`);
      }
      
      localStorage.setItem("agroot_user", JSON.stringify({ email, phone }));
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/home"); 
      }, 2800); 

    } catch (err) {
      triggerError(err.message || "Verification Failed");
      console.error("VERIFY OTP ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // Card Tilt Handler
  const handleMouseMoveCard = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = -((y - centerY) / centerY) * 4;
    const rotateY = ((x - centerX) / centerX) * 4;
    
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeaveCard = () => {
    setTilt({ x: 0, y: 0 });
  };

  const validateEmail = (val) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  // Framer Motion staggered child variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.4 } }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 85, damping: 18, delay: 0.05 } }
  };

  return (
    <div className="relative min-h-screen w-full grid grid-cols-1 md:grid-cols-12 font-sans overflow-hidden bg-black select-none text-zinc-100">
      
      {/* 1. Desktop Left Pane - Sleek Dark Feature Carousel */}
      <div className="hidden md:flex md:col-span-5 flex-col justify-between p-12 bg-gradient-to-br from-zinc-950 via-black to-zinc-900 border-r border-zinc-900 relative overflow-hidden">
        {/* Soft glowing emerald halo in left top */}
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Small Brand Header */}
        <div className="flex items-center gap-2.5 z-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-md">
            <span className="text-xl">🪴</span>
          </div>
          <span className="text-lg font-bold text-white tracking-wider">Agroot</span>
        </div>

        {/* Carousel slide items */}
        <div className="my-auto z-10 max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="space-y-6"
            >
              {/* Animated illustration container */}
              <div className="mb-8">
                {slides[activeSlide].type === "weather" && <WeatherGraphic />}
                {slides[activeSlide].type === "rental" && <RentalGraphic />}
                {slides[activeSlide].type === "soil" && <SoilGraphic />}
                {slides[activeSlide].type === "seeds" && <SeedsGraphic />}
              </div>

              {/* Subheading Badge */}
              <span className="inline-block px-3.5 py-1 rounded-full text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase tracking-widest">
                {slides[activeSlide].subtitle}
              </span>

              {/* Slide Heading */}
              <h2 className="text-2xl font-bold text-white leading-tight">
                {slides[activeSlide].title}
              </h2>

              {/* Slide description */}
              <p className="text-zinc-400 text-sm leading-relaxed">
                {slides[activeSlide].desc}
              </p>

              {/* Feature telemetry statistic */}
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs bg-emerald-500/5 rounded-2xl py-2 px-3 border border-emerald-500/10 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{slides[activeSlide].metric}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot Pagination indicators */}
          <div className="flex gap-2.5 mt-8 items-center">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => {
                  setActiveSlide(idx);
                  addLog(`Carousel dot clicked: Slide ${idx}`);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeSlide === idx ? "w-7 bg-emerald-500" : "w-2 bg-zinc-800 hover:bg-zinc-700"
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Small branding footer */}
        <div className="z-10 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          © Agroot agricultural technologies
        </div>
      </div>

      {/* 2. Right Pane - Sleek Black Canvas for Form */}
      <div className="col-span-1 md:col-span-7 flex flex-col justify-center items-center p-6 relative overflow-hidden min-h-screen">
        
        {/* Ambient Mouse Radial Glow (Emerald green glow trails on solid black) */}
        {isInside && (
          <div
            className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-700 hidden sm:block"
            style={{
              background: `radial-gradient(500px at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.08), transparent 85%)`
            }}
          />
        )}

        {/* 3. Form and Card */}
        <AnimatePresence>
          {!isSuccess && (
            <motion.div
              className="relative z-20 w-full max-w-[450px] flex flex-col justify-center py-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Brand Logo visible on mobile only */}
              <motion.div variants={childVariants} className="flex flex-col items-center mb-6 md:hidden">
                <div className="w-16 h-16 rounded-[1.8rem] flex items-center justify-center backdrop-blur-xl shadow-md bg-zinc-900/50 border border-zinc-800/80 mb-2.5">
                  <span className="text-3xl">🪴</span>
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Agroot</h1>
              </motion.div>

              {/* Glassmorphic Form Card (Sleek Dark Glassmorphism) */}
              <motion.div
                variants={cardVariants}
                animate={isError ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
                transition={isError ? { duration: 0.5, ease: "easeInOut" } : {}}
                onMouseMove={handleMouseMoveCard}
                onMouseLeave={handleMouseLeaveCard}
                className="w-full rounded-[2.5rem] p-8 backdrop-blur-2xl shadow-[0_30px_70px_rgba(0,0,0,0.6)] border border-zinc-800/80 relative bg-zinc-950/65 overflow-hidden transition-all duration-300 text-zinc-100"
                style={{
                  transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                  boxShadow: focusedInput ? "0 35px 65px rgba(16, 185, 129, 0.05)" : "0 30px 70px rgba(0,0,0,0.6)"
                }}
              >
                <h2 className="font-bold text-2xl text-white mb-6 tracking-wide text-center">
                  {step === "phone" ? "Sow Your Seeds" : "Verify Your Harvest"}
                </h2>

                <div className="space-y-6 relative">
                  
                  {/* Email Field */}
                  <motion.div variants={childVariants} className="relative">
                    <div className="relative flex items-center group">
                      <span className={`absolute left-4 z-10 transition-colors duration-300 ${emailFocused || email ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => {
                          setEmailFocused(true);
                          setFocusedInput('email');
                        }}
                        onBlur={() => {
                          setEmailFocused(false);
                          setFocusedInput(null);
                        }}
                        className="w-full rounded-2xl pl-12 pr-10 py-4 text-sm outline-none transition-all text-zinc-100 bg-zinc-900/35 border border-zinc-800/80 focus:border-emerald-500 focus:bg-zinc-900/70 focus:ring-4 focus:ring-emerald-500/10 placeholder-transparent"
                        id="email-input-field"
                      />
                      <label
                        htmlFor="email-input-field"
                        className={`absolute left-12 transition-all duration-300 pointer-events-none font-semibold ${
                          emailFocused || email 
                            ? '-translate-y-3.5 scale-75 text-emerald-400 bg-zinc-950 px-2 rounded-md border border-zinc-800 shadow-md' 
                            : 'text-zinc-500 text-sm'
                        }`}
                      >
                        Email Address
                      </label>
                      
                      {email && (
                        <span className="absolute right-4 z-10 flex items-center">
                          {validateEmail(email) ? (
                            <svg className="w-5 h-5 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                        </span>
                      )}
                    </div>
                    
                    {focusedInput === 'email' && (
                      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
                         <AnimatePresence>
                            {particles.map((p) => (
                               <motion.div
                                  key={p.id}
                                  initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                                  animate={{ opacity: 0, x: p.x, y: p.y, scale: 1, rotate: p.rotation }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: p.duration, ease: "easeOut", delay: p.delay }}
                                  className="absolute left-1/2 top-1/2 rounded-full bg-emerald-500/30 blur-[0.5px]"
                                  style={{ width: p.size, height: p.size }}
                               />
                            ))}
                         </AnimatePresence>
                      </div>
                    )}
                  </motion.div>

                  {/* Phone Field & Language Selector in Step "phone" */}
                  {step === "phone" && (
                    <>
                      <motion.div
                        variants={childVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="relative"
                      >
                        <div className="relative flex items-center group">
                          <span className={`absolute left-4 z-10 transition-colors duration-300 ${phoneFocused || phone ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            <svg className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                          </span>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
                            onFocus={() => {
                              setPhoneFocused(true);
                              setFocusedInput('phone');
                            }}
                            onBlur={() => {
                              setPhoneFocused(false);
                              setFocusedInput(null);
                            }}
                            className="w-full rounded-2xl pl-12 pr-10 py-4 text-sm outline-none transition-all text-zinc-100 bg-zinc-900/35 border border-zinc-800/80 focus:border-emerald-600 focus:bg-zinc-900/70 focus:ring-4 focus:ring-emerald-600/10 placeholder-transparent"
                            id="phone-input-field"
                          />
                          <label
                            htmlFor="phone-input-field"
                            className={`absolute left-12 transition-all duration-300 pointer-events-none font-semibold ${
                              phoneFocused || phone 
                                ? '-translate-y-3.5 scale-75 text-emerald-400 bg-zinc-950 px-2 rounded-md border border-zinc-800 shadow-sm' 
                                : 'text-zinc-500 text-sm'
                            }`}
                          >
                            Phone Number
                          </label>
                          
                          {phone && (
                            <span className="absolute right-4 z-10 flex items-center">
                              {phone.length === 10 ? (
                                <svg className="w-5 h-5 text-emerald-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              ) : (
                                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                              )}
                            </span>
                          )}
                        </div>

                        {focusedInput === 'phone' && (
                          <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl">
                             <AnimatePresence>
                                {particles.map((p) => (
                                   <motion.div
                                      key={p.id}
                                      initial={{ opacity: 1, x: 0, y: 0, scale: 0, rotate: 0 }}
                                      animate={{ opacity: 0, x: p.x, y: p.y, scale: 1, rotate: p.rotation }}
                                      exit={{ opacity: 0 }}
                                      transition={{ duration: p.duration, ease: "easeOut", delay: p.delay }}
                                      className="absolute left-1/2 top-1/2 rounded-full bg-emerald-500/30 blur-[0.5px]"
                                      style={{ width: p.size, height: p.size }}
                                   />
                                ))}
                             </AnimatePresence>
                          </div>
                        )}
                      </motion.div>

                      {/* Language Selection option inside card (Under Phone Number/Credentials) */}
                      <motion.div
                        variants={childVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="space-y-2 mt-4"
                      >
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider pl-1">
                          App Language / भाषा / மொழி
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {languages.map((lang) => (
                            <motion.button
                              key={lang.code}
                              type="button"
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleSelectLanguage(lang.code)}
                              className={`py-2 px-1 rounded-xl border text-[11px] font-bold text-center transition-all ${
                                language === lang.code
                                  ? "bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/15"
                                  : "bg-zinc-900/35 border border-zinc-800 text-zinc-300 hover:bg-zinc-900/70"
                              }`}
                            >
                              {lang.label}
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}

                  {/* OTP Code Boxes */}
                  {step === "otp" && (
                    <motion.div
                      variants={childVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="space-y-4"
                    >
                      <div className="flex gap-2 justify-between w-full relative">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.96 }}
                            animate={otp[index] ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.18 }}
                            className="flex-1 max-w-[3rem] aspect-[5/6]"
                          >
                            <input
                              id={`otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              className={`w-full h-full text-center text-xl font-bold rounded-2xl outline-none transition-all border text-zinc-100 bg-zinc-900/35 border-zinc-800/80 focus:bg-zinc-900/70 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 shadow-sm ${
                                isError ? "border-red-500 bg-red-950/20 text-red-300 animate-pulse" : ""
                              }`}
                              value={otp[index]}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, "");
                                const newOtp = [...otp];
                                
                                if (val) {
                                    newOtp[index] = val.slice(-1);
                                    setOtp(newOtp);
                                    if (index < 5) {
                                        const nextInput = document.getElementById(`otp-${index + 1}`);
                                        if (nextInput) nextInput.focus();
                                    }
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Backspace") {
                                    const newOtp = [...otp];
                                    if (newOtp[index]) {
                                        newOtp[index] = "";
                                        setOtp(newOtp);
                                    } else if (index > 0) {
                                        newOtp[index - 1] = "";
                                        setOtp(newOtp);
                                        const prevInput = document.getElementById(`otp-${index - 1}`);
                                        if (prevInput) prevInput.focus();
                                    }
                                }
                              }}
                              onFocus={(e) => {
                                setFocusedInput('otp');
                                e.target.select();
                              }}
                              onBlur={() => setFocusedInput(null)}
                              onPaste={(e) => {
                                e.preventDefault();
                                const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
                                if (pasted) {
                                    const newOtp = [...otp];
                                    for(let i=0; i<pasted.length; i++){
                                      if(index + i < 6) newOtp[index + i] = pasted[i];
                                    }
                                    setOtp(newOtp);
                                    const nextIdx = Math.min(index + pasted.length, 5);
                                    const nextInput = document.getElementById(`otp-${nextIdx}`);
                                    if (nextInput) nextInput.focus();
                                }
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Primary Gradient Action Button */}
                  <motion.div variants={childVariants} className="pt-2">
                    <motion.button
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      disabled={loading}
                      onClick={step === "phone" ? handleSendOTP : handleVerifyOTP}
                      className="w-full block py-4 rounded-2xl text-white font-bold text-sm shadow-[0_12px_24px_rgba(16,185,129,0.15)] transition-all overflow-hidden relative group bg-gradient-to-r from-emerald-800 via-emerald-600 to-emerald-400 cursor-pointer"
                      style={{
                        opacity: loading ? 0.8 : 1,
                        cursor: loading ? "not-allowed" : "pointer"
                      }}
                    >
                      {/* Shimmer sweep glow */}
                      <div className="absolute inset-0 w-1/2 h-full shimmer-sweep bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-[150%] group-hover:animate-[shimmer_1.4s_infinite]" />
                      
                      {loading ? (
                        <div className="flex items-center justify-center gap-2.5">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="uppercase tracking-wider">Processing...</span>
                        </div>
                      ) : (
                        <span className="uppercase tracking-widest">{step === "phone" ? "Continue" : "Verify Code"}</span>
                      )}
                    </motion.button>
                  </motion.div>

                  {/* Back setup link */}
                  {step === "otp" && (
                    <motion.button
                      variants={childVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      onClick={() => {
                        setStep("phone");
                        setOtp(["", "", "", "", "", ""]);
                      }}
                      className="w-full py-1 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to phone setup
                    </motion.button>
                  )}

                  {/* Social Dividers & Mock Actions (Visible only on phone step) */}
                  {step === "phone" && (
                    <motion.div variants={childVariants} className="pt-2 space-y-4">
                      <div className="flex items-center">
                        <div className="flex-grow border-t border-zinc-800/60" />
                        <span className="px-3.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Or continue with</span>
                        <div className="flex-grow border-t border-zinc-800/60" />
                      </div>

                      {/* Google & Apple Grid */}
                      <div className="grid grid-cols-2 gap-3.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addLog("Google Auth integration clicked")}
                          className="py-3 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/35 text-xs font-bold text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-900/60 transition-all cursor-pointer shadow-sm"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                          </svg>
                          <span>Google</span>
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addLog("Apple Auth integration clicked")}
                          className="py-3 px-4 rounded-2xl border border-zinc-800 bg-zinc-900/35 text-xs font-bold text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-900/60 transition-all cursor-pointer shadow-sm"
                        >
                          <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C3.84 16.37 3.37 9.87 6.84 6.32c1.7-1.73 3.51-1.63 4.88-1.08 1.4.56 2.19.53 3.38 0 1.54-.68 3.52-.94 4.95.84-2.95 2.13-2.31 6.54.49 7.77-1.44 3.73-3.01 6.86-5.45 6.43zm-2.92-16.7c.07-2.3-1.89-4.22-4.14-4.14-.07 2.3 1.9 4.22 4.14 4.14z"/>
                          </svg>
                          <span>Apple</span>
                        </motion.button>
                      </div>

                      {/* Guest Action */}
                      <div className="text-center pt-2">
                        <button
                          onClick={() => {
                            addLog("Entering Guest Mode");
                            localStorage.setItem("agroot_user", JSON.stringify({ email: "guest@agroot.local", phone: "0000000000" }));
                            setIsSuccess(true);
                            setTimeout(() => navigate("/home"), 2800); 
                          }}
                          className="text-xs font-bold text-zinc-400 hover:text-zinc-200 transition-colors underline flex items-center justify-center gap-1 mx-auto"
                        >
                          Continue as Guest
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Success Overlay - Sprout & Confetti (Bespoke Dark Success Visuals) */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md"
            >
              {/* Floating success sparkles */}
              <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {confetti.map((c) => (
                  <motion.div
                    key={c.id}
                    className="absolute rounded-sm"
                    style={{
                      width: c.size,
                      height: c.size * 0.65,
                      backgroundColor: c.color,
                      left: "50%",
                      top: "45%",
                    }}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                    animate={{
                      x: c.targetX,
                      y: c.targetY,
                      opacity: 0,
                      rotate: c.rotation
                    }}
                    transition={{
                      duration: 2.2,
                      ease: "easeOut",
                      delay: c.delay
                    }}
                  />
                ))}
              </div>

              {/* Sprout SVG Graphic */}
              <div className="z-10 flex flex-col items-center">
                <div className="w-36 h-36 flex items-center justify-center bg-zinc-950/60 rounded-full border border-zinc-800/60 shadow-lg relative p-4 mb-6">
                  <svg className="w-full h-full text-emerald-500 filter drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]" viewBox="0 0 100 100">
                    <motion.path
                      d="M 50 85 C 50 62, 45 42, 52 23"
                      fill="transparent"
                      stroke="#10B981"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.4, ease: "easeOut" }}
                    />
                    <motion.path
                      d="M 50 55 C 33 46, 23 52, 27 66 C 32 71, 44 65, 49 57"
                      fill="#34D399"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      initial={{ scale: 0, originX: "50px", originY: "55px" }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: "spring", stiffness: 120, damping: 10 }}
                    />
                    <motion.path
                      d="M 51 40 C 66 31, 76 33, 74 47 C 71 53, 59 51, 51 42"
                      fill="#059669"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      initial={{ scale: 0, originX: "51px", originY: "40px" }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.1, type: "spring", stiffness: 120, damping: 10 }}
                    />
                    <motion.path
                      d="M 52 23 C 48 16, 52 8, 54 6 C 56 8, 60 16, 52 23"
                      fill="#a7f3d0"
                      stroke="#10B981"
                      strokeWidth="2.5"
                      initial={{ scale: 0, originX: "52px", originY: "23px" }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.3, type: "spring", stiffness: 140 }}
                    />
                    <path d="M 28 85 Q 50 81 72 85 Q 50 91 28 85" fill="#583f23" stroke="#10B981" strokeWidth="1.5" />
                  </svg>
                </div>

                <motion.div
                   initial={{ opacity: 0, y: 15 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.9, type: "spring" }}
                   className="text-center"
                >
                   <h2 className="text-3xl font-extrabold text-white tracking-tight">Verified & Rooted!</h2>
                   <p className="text-emerald-400 text-sm font-semibold tracking-wide mt-1.5 uppercase">Welcome to the Agroot Network</p>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 6. Floating Developer console and trigger */}
        <div className="fixed bottom-4 right-4 z-40">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowConsole(!showConsole)}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-slate-400 bg-zinc-900/65 border border-zinc-800/80 backdrop-blur-md shadow-md hover:bg-zinc-900/80 transition-all ${
              showConsole ? 'ring-2 ring-emerald-500 bg-slate-900 border-slate-700 text-emerald-400' : ''
            }`}
            title="Developer Terminal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.button>
        </div>

        <AnimatePresence>
          {showConsole && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 h-64 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 z-50 text-slate-300 font-mono text-xs flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-slate-400 select-text">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-semibold text-slate-300">Agroot Dev Environment Console</span>
                </div>
                <button
                  onClick={() => setShowConsole(false)}
                  className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-hide select-text">
                {debugLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed border-b border-slate-900/40 pb-1.5">
                    <span className="text-emerald-500 font-bold select-none">›</span> {log}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Global CSS Inject */}
      <style>{`
        @keyframes float-slow {
          0% { transform: translateY(115vh) rotate(0deg); }
          100% { transform: translateY(-15vh) rotate(360deg); }
        }
        @keyframes shimmer {
          100% { transform: translateX(150%) skewX(-12deg); }
        }
        @keyframes wobble {
          0% { transform: translateX(-6px); }
          100% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
};

export default Login;