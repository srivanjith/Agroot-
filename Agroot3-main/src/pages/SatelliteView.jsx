import { useEffect, useState, useRef } from "react";
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

const SOIL_DB = {
    "Tamil Nadu": { type: "Red Laterite", best: "Rice" },
    "Kerala": { type: "Laterite", best: "Coconut" },
    "Karnataka": { type: "Red & Black", best: "Cotton" },
    "Andhra Pradesh": { type: "Black Cotton", best: "Cotton" },
    "Telangana": { type: "Red Sandy", best: "Groundnut" },
    "Maharashtra": { type: "Regur (Black)", best: "Soybean" },
    "Gujarat": { type: "Alluvial", best: "Wheat" },
    "Rajasthan": { type: "Desert Sandy", best: "Bajra" },
    "Uttar Pradesh": { type: "Alluvial", best: "Wheat" },
    "Punjab": { type: "Alluvial", best: "Wheat" },
    "West Bengal": { type: "Alluvial", best: "Rice" },
};

const TILE_LAYERS = {
    satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles © Esri",
        label: "🛰️ Satellite",
    },
    street: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "© OpenStreetMap contributors",
        label: "🗺️ Map",
    },
    terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: "© OpenTopoMap",
        label: "⛰️ Terrain",
    },
};

// Component to recenter map when coords change
const RecenterMap = ({ lat, lon }) => {
    const map = useMap();
    useEffect(() => { map.setView([lat, lon], 14); }, [lat, lon, map]);
    return null;
};

const getWeatherDesc = (code) => {
    if (code === 0) return { label: "Clear Sky", icon: "☀️", advisory: "Sunny & clear. Good time for solar drying and field preparation." };
    if (code >= 1 && code <= 3) return { label: "Partly Cloudy", icon: "⛅", advisory: "Mainly clear. Favorable for most agricultural operations." };
    if (code >= 45 && code <= 48) return { label: "Foggy", icon: "🌫", advisory: "Low visibility. Delay morning sprays or transport." };
    if (code >= 51 && code <= 67) return { label: "Rainy", icon: "🌧", advisory: "Rainfall detected. Postpone irrigation and chemical spraying." };
    if (code >= 71 && code <= 77) return { label: "Snowy", icon: "❄️", advisory: "Freezing conditions. Protect sensitive frost-susceptible crops." };
    if (code >= 95) return { label: "Thunderstorm", icon: "⛈", advisory: "Severe weather. Seek shelter; avoid open fields and high trees." };
    return { label: "Mild", icon: "🌡", advisory: "Stable conditions. Standard crop monitoring advised." };
};

const SatelliteView = () => {
    const [coords, setCoords] = useState(null);
    const [location, setLocation] = useState(null);
    const [soilInfo, setSoilInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeLayer, setActiveLayer] = useState("satellite");
    const [infoOpen, setInfoOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [weatherInfo, setWeatherInfo] = useState(null);

    const fetchWeatherForCoords = async (lat, lon) => {
        try {
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
            );
            const data = await response.json();
            if (data && data.current) {
                setWeatherInfo({
                    temp: data.current.temperature_2m,
                    humidity: data.current.relative_humidity_2m,
                    weatherCode: data.current.weather_code,
                    windSpeed: data.current.wind_speed_10m
                });
            }
        } catch (err) {
            console.error("Error fetching weather for satellite view:", err);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        setError(null);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(searchQuery)}`
            );
            const data = await res.json();
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                setCoords({ lat, lon });
                
                const address = result.address || {};
                const city = address.city || address.town || address.village || address.suburb || address.county || result.name || "Searched Location";
                const state = address.state || address.region || "";
                
                setLocation({ city, state, lat, lon });
                
                const key = Object.keys(SOIL_DB).find(k =>
                    state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
                );
                setSoilInfo(key ? SOIL_DB[key] : { type: "Alluvial", best: "Wheat" });
                
                await fetchWeatherForCoords(lat, lon);
                setInfoOpen(true);
            } else {
                setError("Location not found. Try a different search.");
                setTimeout(() => setError(null), 4000);
            }
        } catch (err) {
            console.error("Search error:", err);
            setError("Error searching location. Please try again.");
            setTimeout(() => setError(null), 4000);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            const defaultLat = 20.5937;
            const defaultLon = 78.9629;
            setCoords({ lat: defaultLat, lon: defaultLon }); // India center
            fetchWeatherForCoords(defaultLat, defaultLon);
            setLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                setCoords({ lat: latitude, lon: longitude });
                fetchWeatherForCoords(latitude, longitude);
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                    );
                    const data = await res.json();
                    const state = data.address?.state || "";
                    const city = data.address?.city || data.address?.town || data.address?.village || "Your Location";
                    setLocation({ city, state, lat: latitude, lon: longitude });
                    const key = Object.keys(SOIL_DB).find(k =>
                        state.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(state.toLowerCase())
                    );
                    setSoilInfo(key ? SOIL_DB[key] : { type: "Alluvial", best: "Wheat" });
                } catch { /* silent */ }
                setLoading(false);
            },
            () => {
                setError("Location access denied.");
                const defaultLat = 20.5937;
                const defaultLon = 78.9629;
                setCoords({ lat: defaultLat, lon: defaultLon });
                fetchWeatherForCoords(defaultLat, defaultLon);
                setLoading(false);
            }
        );
    }, []);

    return (
        <div className="min-h-screen w-full bg-gray-900 font-sans flex flex-col relative">

            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-none flex items-center justify-between px-5 py-4 bg-gray-900/90 backdrop-blur-md border-b border-white/10 z-30 relative"
            >
                <div className="flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/10 text-white transition-colors">←</button>
                    <div>
                        <h1 className="text-white font-bold text-lg">🛰️ Satellite View</h1>
                        <p className="text-gray-400 text-xs">
                            {loading ? "Detecting location..." : location ? `${location.city}, ${location.state}` : "India"}
                        </p>
                    </div>
                </div>

                {/* Layer toggle */}
                <div className="flex gap-1 bg-white/10 rounded-xl p-1">
                    {Object.entries(TILE_LAYERS).map(([key, val]) => (
                        <button
                            key={key}
                            onClick={() => setActiveLayer(key)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${activeLayer === key ? "bg-white text-gray-900 shadow" : "text-white/70 hover:text-white"
                                }`}
                        >
                            {val.label}
                        </button>
                    ))}
                </div>
            </motion.header>

            {/* Map — explicit height required by Leaflet */}
            <div className="relative" style={{ height: "calc(100dvh - 72px)" }}>
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-12 h-12 rounded-full border-4 border-gray-700 border-t-green-400"
                        />
                        <p className="text-gray-400 text-sm animate-pulse">Acquiring satellite position...</p>
                    </div>
                ) : (
                    <MapContainer
                        center={[coords.lat, coords.lon]}
                        zoom={14}
                        style={{ height: "100%", width: "100%" }}
                        zoomControl={false}
                    >
                        <RecenterMap lat={coords.lat} lon={coords.lon} />
                        <TileLayer
                            key={activeLayer}
                            url={TILE_LAYERS[activeLayer].url}
                            attribution={TILE_LAYERS[activeLayer].attribution}
                            maxZoom={19}
                        />
                        {coords && (
                            <Marker position={[coords.lat, coords.lon]}>
                                <Popup>
                                    <div className="text-sm font-semibold">📍 {location?.city || "Your Farm"}</div>
                                    {soilInfo && <div className="text-xs text-gray-500 mt-1">Soil: {soilInfo.type}</div>}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                )}

                {/* Floating Search Bar Overlay */}
                {!loading && (
                    <div className="absolute top-4 left-4 z-[1000] w-80 max-w-[calc(100%-2rem)] md:w-96">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-1.5 shadow-2xl transition-all duration-300 focus-within:border-green-500/50 focus-within:ring-2 focus-within:ring-green-500/20">
                            <div className="flex-1 flex items-center pl-2">
                                <span className="text-gray-400 text-sm">🔍</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search location (e.g. Thanjavur)..."
                                    className="w-full bg-transparent text-white placeholder-gray-400 text-sm pl-2 pr-1 py-1 focus:outline-none"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={searching}
                                className="bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white rounded-xl px-4 py-2 text-xs font-semibold shadow transition-all hover:scale-105 active:scale-95 flex items-center justify-center min-w-[70px]"
                            >
                                {searching ? (
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    "Search"
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Info Panel */}
                {!loading && (
                    <AnimatePresence>
                        {infoOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-4 left-4 right-4 md:left-auto md:right-5 md:w-80 z-20 bg-gray-900/90 backdrop-blur-md rounded-3xl p-5 border border-white/10 shadow-2xl max-h-[70vh] overflow-y-auto"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs uppercase tracking-widest text-green-400 font-bold">Field Info</p>
                                    <button onClick={() => setInfoOpen(false)} className="text-white/40 hover:text-white text-xs">✕</button>
                                </div>

                                <div className="space-y-2.5">
                                    {[
                                        { label: "Location", value: location ? `${location.city}, ${location.state}` : "India", icon: "📍" },
                                        { label: "Coordinates", value: coords ? `${coords.lat.toFixed(4)}°N, ${coords.lon.toFixed(4)}°E` : "—", icon: "🌐" },
                                        { label: "Soil Type", value: soilInfo?.type || "Alluvial", icon: "🌍" },
                                        { label: "Best Crop", value: soilInfo?.best || "Wheat", icon: "🌾" },
                                    ].map(item => (
                                        <div key={item.label} className="flex items-center gap-3">
                                            <span className="text-lg w-7">{item.icon}</span>
                                            <div>
                                                <p className="text-[10px] text-gray-500 uppercase tracking-wide">{item.label}</p>
                                                <p className="text-white text-sm font-medium">{item.value}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {weatherInfo && (
                                        <>
                                            <div className="border-t border-white/10 my-2 pt-2" />
                                            
                                            {/* Weather summary */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg w-7">{getWeatherDesc(weatherInfo.weatherCode).icon}</span>
                                                <div>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Climate Condition</p>
                                                    <p className="text-white text-sm font-medium">
                                                        {Math.round(weatherInfo.temp)}°C — {getWeatherDesc(weatherInfo.weatherCode).label}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Humidity & Wind */}
                                            <div className="grid grid-cols-2 gap-2 pl-10 text-[11px] text-gray-400">
                                                <div>💧 Humidity: <span className="text-white font-medium">{weatherInfo.humidity}%</span></div>
                                                <div>💨 Wind: <span className="text-white font-medium">{weatherInfo.windSpeed} km/h</span></div>
                                            </div>

                                            {/* Farming Recommendation */}
                                            <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5">
                                                <p className="text-[10px] text-green-400 font-bold uppercase tracking-wider mb-1">💡 Climate Advisory</p>
                                                <p className="text-white text-xs leading-relaxed">
                                                    {getWeatherDesc(weatherInfo.weatherCode).advisory}
                                                    {weatherInfo.temp > 35 && " High temperature suggests heavy evaporation; ensure proper soil moisture."}
                                                    {weatherInfo.temp < 15 && " Low temperature suggests protecting vulnerable young saplings."}
                                                    {weatherInfo.humidity > 80 && " High humidity raises the risk of fungal infections; monitor closely."}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="mt-4 pt-3 border-t border-white/10">
                                    <p className="text-[10px] text-gray-500 text-center">Powered by ESRI World Imagery & OpenStreetMap</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}

                {/* Re-open info button */}
                {!loading && !infoOpen && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setInfoOpen(true)}
                        className="absolute bottom-5 right-5 z-20 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg hover:bg-green-600 transition-colors"
                    >
                        ℹ️ Field Info
                    </motion.button>
                )}
            </div>

            {error && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-yellow-500/90 text-yellow-900 text-xs px-4 py-2 rounded-full z-30">
                    ⚠️ {error}
                </div>
            )}
        </div>
    );
};

export default SatelliteView;
