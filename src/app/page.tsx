"use client";

import { useStockTracker } from "@/hooks/useStockTracker";

export default function Home() {
  const {
    data,
    location,
    setLocation,
    savedLocation,
    setTrackingLocation,
    clearTracking,
    isScanning
  } = useStockTracker();

  const formatTime = (ts: number | null | undefined) => {
    if (!ts) return "UNKNOWN";
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="box">
      <div className="title">DIET COKE TRACKER</div>
      
      {!savedLocation ? (
         <div style={{ marginBottom: '2rem' }}>
           <div style={{ marginBottom: '1rem' }}>ENTER DELIVERY LOCATION:</div>
           <input 
             value={location} 
             onChange={e => setLocation(e.target.value)}
             style={{ width: '100%', padding: '0.8rem', background: '#000', color: '#fff', border: '1px solid #fff', marginBottom: '1rem', fontFamily: 'inherit', fontSize: '1rem' }}
             placeholder="e.g. 14th A Cross Road, Indiranagar"
           />
           <button 
             onClick={() => setTrackingLocation(location)}
             style={{ width: '100%', padding: '1rem', background: '#fff', color: '#000', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}
           >
             START TRACKING
           </button>
         </div>
      ) : (
         <>
           <div style={{ marginBottom: '1.5rem', borderBottom: '1px dashed #444', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>Location: <strong style={{color:'#fff'}}>{savedLocation}</strong></div>
             <button 
                onClick={clearTracking} 
                style={{ background:'transparent', color:'#888', border:'1px solid #888', padding:'0.2rem 0.5rem', cursor:'pointer', fontFamily:'inherit' }}
             >
                CHANGE
             </button>
           </div>
           
           {isScanning ? (
             <div style={{ lineHeight: '1.5' }}>
               <div>[ SCANNING INVENTORY (POLLING)... ]</div>
               <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
                 {"(Checking Zepto stock in background, please wait ~20s...)"}
               </div>
             </div>
           ) : (
             <>
                <div className="row">
                  <span>Zepto</span>
                  <span className={data?.zepto === 'IN_STOCK' ? 'status-in' : 'status-out'}>
                    {data?.zepto === 'IN_STOCK' ? '✅ YES' : '❌ NO'}
                  </span>
                </div>
                <div className="row">
                  <span style={{ color: '#666' }}>Blinkit</span>
                  <span className="status-out">❌ PENDING</span>
                </div>
                <div className="row">
                  <span style={{ color: '#666' }}>Instamart</span>
                  <span className="status-out">❌ PENDING</span>
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
