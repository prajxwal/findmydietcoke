import { useState, useEffect, useCallback } from "react";
import { StockData } from "@/types/stock";

interface GeoState {
  lat: number | null;
  lng: number | null;
  address: string | null;
  error: string | null;
  loading: boolean;
}

export function useStockTracker() {
  const [data, setData] = useState<StockData | null>(null);
  const [geo, setGeo] = useState<GeoState>({
    lat: null, lng: null, address: null, error: null, loading: true
  });

  // Auto-detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo(g => ({ ...g, loading: false, error: "Geolocation not supported" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        // Reverse geocode to get a human-readable address
        let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geo = await res.json();
          if (geo.display_name) {
            // Shorten: take first 3 parts of the address
            address = geo.display_name.split(",").slice(0, 3).join(",").trim();
          }
        } catch (e) {
          // Fallback to raw coords — still functional
        }

        setGeo({ lat: latitude, lng: longitude, address, error: null, loading: false });
      },
      (err) => {
        setGeo(g => ({ ...g, loading: false, error: "Location access denied. Please allow location access." }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Poll stock API when we have coordinates
  useEffect(() => {
    if (!geo.lat || !geo.lng) return;

    const fetchData = () => {
      fetch(`/api/stock?lat=${geo.lat}&lng=${geo.lng}`)
        .then(res => res.json())
        .then((d: StockData) => setData(d))
        .catch(err => console.error("Failed to fetch stock:", err));
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [geo.lat, geo.lng]);

  const retryLocation = useCallback(() => {
    setGeo({ lat: null, lng: null, address: null, error: null, loading: true });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const geo = await res.json();
          if (geo.display_name) {
            address = geo.display_name.split(",").slice(0, 3).join(",").trim();
          }
        } catch (e) {}
        setGeo({ lat: latitude, lng: longitude, address, error: null, loading: false });
        setData(null);
      },
      () => {
        setGeo(g => ({ ...g, loading: false, error: "Location access denied." }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const isScanning = !data || !!data.is_scanning || data.zepto === "SCANNING";

  return { data, geo, isScanning, retryLocation };
}
