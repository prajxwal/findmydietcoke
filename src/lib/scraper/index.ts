import { checkZepto } from "./zepto";
import { StockData } from "@/types/stock";

let cache: Record<string, StockData> = {};
let lastUpdated: Record<string, number> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let isScraping: Record<string, boolean> = {};

export async function getStockStatus(lat: number, lng: number): Promise<StockData> {
  // Round to 3 decimal places (~111m precision) for cache key
  const locKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const now = Date.now();

  const isStale = !cache[locKey] || (now - (lastUpdated[locKey] || 0) > CACHE_TTL);

  // Trigger scrape in background if stale and not already scraping
  if (isStale && !isScraping[locKey]) {
    isScraping[locKey] = true;
    checkZepto(lat, lng).then(zepto => {
      cache[locKey] = {
        zepto: zepto ? "IN_STOCK" : "OUT_OF_STOCK",
        blinkit: "UNKNOWN",
        instamart: "UNKNOWN",
        last_updated: Date.now()
      };
      lastUpdated[locKey] = Date.now();
    }).catch(error => {
      console.error("Failed to check stock:", error);
    }).finally(() => {
      isScraping[locKey] = false;
    });
  }

  // Return immediately — scanning state if no cache yet
  return cache[locKey] || {
    zepto: "SCANNING",
    blinkit: "UNKNOWN",
    instamart: "UNKNOWN",
    last_updated: null,
    is_scanning: true
  };
}
