"use client";

import { useStockTracker } from "@/hooks/useStockTracker";

export default function Home() {
  const { data, geo, isScanning, retryLocation } = useStockTracker();

  const formatTime = (ts: number | null | undefined) => {
    if (!ts) return "UNKNOWN";
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="box">
      <div className="title">DIET COKE TRACKER</div>

      {geo.loading ? (
        <div style={{ lineHeight: '1.5' }}>
          <div>[ DETECTING LOCATION... ]</div>
          <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
            Allow location access when prompted.
          </div>
        </div>
      ) : geo.error ? (
        <div style={{ lineHeight: '1.5' }}>
          <div style={{ color: '#888' }}>{geo.error}</div>
          <button
            onClick={retryLocation}
            style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: '#fff', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
          >
            RETRY
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.5rem', borderBottom: '1px dashed #444', paddingBottom: '1rem' }}>
            <span style={{ color: '#888' }}>📍 </span>
            <span>{geo.address}</span>
          </div>

          {isScanning ? (
            <div style={{ lineHeight: '1.5' }}>
              <div>[ SCANNING INVENTORY... ]</div>
              <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
                Checking Zepto stock in background...
              </div>
            </div>
          ) : (
            <>
              <div className="row">
                <span>Zepto</span>
                <span className={data?.zepto === 'IN_STOCK' ? 'status-in' : 'status-out'}>
                  {data?.zepto === 'IN_STOCK' ? '✅ IN STOCK' : '❌ OUT OF STOCK'}
                </span>
              </div>
              <div className="row">
                <span style={{ color: '#666' }}>Blinkit</span>
                <span className="status-out">— PENDING</span>
              </div>
              <div className="row">
                <span style={{ color: '#666' }}>Instamart</span>
                <span className="status-out">— PENDING</span>
              </div>
              <div className="footer">
                LAST UPDATED: {formatTime(data?.last_updated)}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
