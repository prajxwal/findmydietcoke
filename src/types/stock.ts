export interface StockData {
  zepto: 'IN_STOCK' | 'OUT_OF_STOCK' | 'SCANNING' | 'UNKNOWN';
  blinkit: 'IN_STOCK' | 'OUT_OF_STOCK' | 'SCANNING' | 'UNKNOWN';
  instamart: 'IN_STOCK' | 'OUT_OF_STOCK' | 'SCANNING' | 'UNKNOWN';
  last_updated: number | null;
  is_scanning?: boolean;
  error?: string;
}
