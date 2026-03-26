import { useState, useEffect } from "react";
import { StockData } from "@/types/stock";

export function useStockTracker() {
  const [data, setData] = useState<StockData | null>(null);
  const [location, setLocation] = useState<string>("");
  const [savedLocation, setSavedLocation] = useState<string>("");

  useEffect(() => {
    if (!savedLocation) return;
    
    const fetchData = () => {
      fetch(`/api/stock?location=${encodeURIComponent(savedLocation)}`)
        .then(res => res.json())
        .then((d: StockData) => setData(d))
        .catch(err => console.error("Failed to fetch stock:", err));
    };

    fetchData(); // Initial fetch
    
    // Poll every 3 seconds for near-instant UX
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [savedLocation]);

  const setTrackingLocation = (loc: string) => {
    if (loc.trim()) setSavedLocation(loc.trim());
  };

  const clearTracking = () => {
    setSavedLocation("");
    setData(null);
  };

  const isScanning = !data || !!data.is_scanning || data.zepto === 'SCANNING';

  return {
    data,
    location,
    setLocation,
    savedLocation,
    setTrackingLocation,
    clearTracking,
    isScanning
  };
}
