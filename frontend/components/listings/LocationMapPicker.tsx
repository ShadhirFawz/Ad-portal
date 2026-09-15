"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "leaflet/dist/leaflet.css";
import {
  MapPin,
  Search,
  Crosshair,
  Loader2,
  Check,
  X,
  Navigation,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";

export interface SelectedLocationData {
  city: string;
  district: string;
  province: string;
  postalCode: string;
  streetNumber: string;
  lat?: number;
  lng?: number;
  displayName?: string;
}

interface LocationMapPickerProps {
  initialLocation?: {
    city?: string;
    district?: string;
    province?: string;
    postalCode?: string;
    streetNumber?: string;
  };
  onSelectLocation: (data: SelectedLocationData) => void;
  onClose?: () => void;
}

// Helper to extract street number / house number if present in address or display name
function extractStreetNumber(
  address: Record<string, string | undefined>,
  displayName?: string
): string {
  if (address.house_number && address.house_number.trim()) {
    return address.house_number.trim();
  }
  if (address.house_name && address.house_name.trim()) {
    return address.house_name.trim();
  }
  if (address.building && address.building.trim()) {
    return address.building.trim();
  }

  // Check if display name starts with a house/street number pattern (e.g., "256/2B", "12/A", "45A", "108-B")
  if (displayName) {
    const firstPart = displayName.split(",")[0]?.trim() || "";
    // Regex for house numbers like 256/2B, 14A, 42, 12/1, No. 54, etc.
    const match = firstPart.match(/^(?:No\.?\s*)?([0-9]+[A-Za-z0-9\/\-_]*)/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "";
}

// Clean up province / district names (e.g. "Western Province" or "Western", "Colombo District" -> "Colombo")
function cleanDistrict(district?: string): string {
  if (!district) return "";
  return district.replace(/\s+District$/i, "").trim();
}

function cleanProvince(province?: string): string {
  if (!province) return "";
  return province.trim();
}

export default function LocationMapPicker({
  initialLocation,
  onSelectLocation,
  onClose,
}: LocationMapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Default coordinate: Sri Lanka (Colombo center approx)
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: 6.9271,
    lng: 79.8612,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);

  const [parsedLocation, setParsedLocation] = useState<SelectedLocationData>({
    city: initialLocation?.city || "",
    district: initialLocation?.district || "",
    province: initialLocation?.province || "",
    postalCode: initialLocation?.postalCode || "",
    streetNumber: initialLocation?.streetNumber || "",
  });

  const [reverseGeocodedName, setReverseGeocodedName] = useState<string>("");

  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Lock background page scroll while map picker is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, []);

  // Close search results dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchResults([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reverse Geocoding via OpenStreetMap Nominatim
  const performReverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      setGeocoding(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en",
          },
        });
        if (!res.ok) throw new Error("Reverse geocode failed");
        const data = await res.json();
        const address = data.address || {};

        const city =
          address.city ||
          address.town ||
          address.village ||
          address.suburb ||
          address.municipality ||
          address.hamlet ||
          address.neighbourhood ||
          "";

        const district = cleanDistrict(
          address.state_district || address.county || address.district
        );

        const province = cleanProvince(
          address.state || address.province || address.region
        );

        const postalCode = address.postcode || "";
        const streetNumber = extractStreetNumber(address, data.display_name);

        const newParsed: SelectedLocationData = {
          city,
          district,
          province,
          postalCode,
          streetNumber,
          lat,
          lng,
          displayName: data.display_name,
        };

        setParsedLocation(newParsed);
        setReverseGeocodedName(data.display_name || "");
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setGeocoding(false);
      }
    },
    []
  );

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;
      const L = (await import("leaflet")).default;

      if (isCancelled) return;

      // Clean up previous instance if exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const initialLat = coords.lat;
      const initialLng = coords.lng;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: false,
      });

      // Add zoom control in top right
      L.control.zoom({ position: "topright" }).addTo(map);

      // OpenStreetMap Tile Layer
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Force recalculation of map container dimensions once rendered
      setTimeout(() => {
        if (!isCancelled && map) {
          map.invalidateSize();
        }
      }, 150);

      setTimeout(() => {
        if (!isCancelled && map) {
          map.invalidateSize();
        }
      }, 500);

      // Custom Emerald Marker Pin HTML
      const pinIcon = L.divIcon({
        className: "custom-map-pin",
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 42px; height: 42px; transform: translate(-50%, -100%);">
            <div style="width: 38px; height: 38px; background: #059669; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 4px 14px rgba(5, 150, 105, 0.45); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center;">
              <div style="width: 12px; height: 12px; background: #ffffff; border-radius: 50%; transform: rotate(45deg);"></div>
            </div>
            <div style="position: absolute; bottom: -4px; width: 14px; height: 4px; background: rgba(0,0,0,0.25); border-radius: 50%; filter: blur(1px);"></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true,
      }).addTo(map);

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Handle marker drag
      marker.on("dragend", (e: any) => {
        const newPos = e.target.getLatLng();
        setCoords({ lat: newPos.lat, lng: newPos.lng });
        performReverseGeocode(newPos.lat, newPos.lng);
      });

      // Handle map click
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        performReverseGeocode(lat, lng);
      });

      // Initial reverse geocode if no full location provided
      if (!initialLocation?.city) {
        performReverseGeocode(initialLat, initialLng);
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Center & update marker position helper
  const updateMapPosition = (lat: number, lng: number, zoom = 15) => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.setView([lat, lng], zoom, { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
    setCoords({ lat, lng });
    performReverseGeocode(lat, lng);
  };

  // Search Address / Place via Nominatim
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchResults([]);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        searchQuery.trim()
      )}&format=json&addressdetails=1&limit=5&countrycodes=lk`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en" },
      });
      if (!res.ok) throw new Error("Search failed");
      const results = await res.json();
      setSearchResults(results);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Select Search Result
  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSearchResults([]);
    setSearchQuery(result.display_name.split(",")[0] || searchQuery);
    updateMapPosition(lat, lng, 16);
  };

  // Geolocate User via GPS
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const { latitude, longitude } = pos.coords;
        updateMapPosition(latitude, longitude, 16);
      },
      (err) => {
        setLocatingUser(false);
        console.warn("Geolocation denied or error:", err);
        alert(
          "Could not detect your location. Please ensure location permissions are enabled, or select manually on the map."
        );
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Apply Selected Location
  const handleConfirm = () => {
    onSelectLocation(parsedLocation);
    if (onClose) onClose();
  };

  return (
    <div
      className="flex flex-col h-full w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl overscroll-contain"
      onClick={(e) => e.stopPropagation()}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/60 backdrop-blur-sm z-30">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-2">
              <span>Pin Listing Location</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Auto-Geocode
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              Click map or drag the pin to automatically populate address fields
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close Map"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Map Search Bar & Quick Controls (High Z-Index so dropdown floats above Map tiles) */}
      <div
        ref={searchContainerRef}
        className="relative p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 z-40"
      >
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city, town, road or neighborhood etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
            className="w-full pl-9 pr-20 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={searching || !searchQuery.trim()}
            className="absolute right-0 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
          >
            {searching ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <span className="flex items-center gap-1">
                <Search className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={locatingUser}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition shrink-0 cursor-pointer disabled:opacity-50"
          title="Use my current GPS position"
        >
          {locatingUser ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
          ) : (
            <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
          )}
          <span>Locate Me</span>
        </button>

        {/* Search Results Dropdown (z-50 over map) */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-3 right-3 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
            <div className="p-2 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <span>Matching Locations</span>
              <button
                type="button"
                onClick={() => setSearchResults([])}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>
            </div>
            {searchResults.map((res, i) => (
              <button
                type="button"
                key={i}
                onClick={() => handleSelectSearchResult(res)}
                className="w-full text-left p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800/50 last:border-b-0 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2 transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="truncate">{res.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Interactive Map Area (z-10 so search dropdown is always above) */}
      <div className="relative w-full h-[360px] sm:h-[420px] bg-slate-100 dark:bg-slate-950 z-10">
        <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: "360px" }} />

        {/* Geocoding Loading Floating Badge */}
        {geocoding && (
          <div className="absolute top-3 left-3 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-md flex items-center gap-2 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
            <span>Resolving address...</span>
          </div>
        )}

        {/* Tip Badge */}
        <div className="absolute bottom-3 left-3 z-20 hidden sm:flex items-center gap-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-medium text-slate-600 dark:text-slate-300 shadow-sm pointer-events-none">
          <Navigation className="w-3 h-3 text-emerald-500" />
          <span>Click anywhere or drag marker</span>
        </div>
      </div>

      {/* Detected Address Details & Confirm Footer */}
      <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Extracted Address Fields</span>
            </h4>
            {reverseGeocodedName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xl mt-0.5">
                {reverseGeocodedName}
              </p>
            )}
          </div>

          <div className="text-[11px] text-slate-400">
            Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>You can tweak any field manually after applying</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="btn-outline w-full sm:w-auto text-xs py-2.5 px-4"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirm}
              className="btn-primary w-full sm:w-auto text-xs py-2.5 px-6 font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply This Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
