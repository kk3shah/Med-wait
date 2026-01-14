'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Navigation, AlertTriangle, Info, RefreshCw } from 'lucide-react'
import { clsx } from 'clsx'

interface ScoredHospital {
  hospital: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    funding_rank: number;
  };
  latestRecord: {
    waitMinutes: number | null;
    lastUpdatedAt: string | null;
    fetchedAt: string;
    parseConfidence: number;
    status: string;
  } | null;
  travelMinutes: number;
  score: number;
  status: 'HIGH' | 'MEDIUM' | 'LOW' | 'NO_DATA';
}

export default function Home() {
  const [data, setData] = useState<ScoredHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)

  useEffect(() => {
    // Attempt to get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocation({ lat: 43.6532, lng: -79.3832 }) // Default to Toronto
      )
    } else {
      setLocation({ lat: 43.6532, lng: -79.3832 })
    }
  }, [])

  useEffect(() => {
    if (location) {
      fetchData()
    }
  }, [location])

  const fetchData = async () => {
    if (!location) return
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:3001/api/recommendations?lat=${location.lat}&lng=${location.lng}`)
      const items = await res.json()
      setData(items)
    } catch (err) {
      console.error('Fetch failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container">
      <header className="hero">
        <h2 className="title">Smart ED Routing</h2>
        <p className="subtitle">Real-time wait times and optimized travel for Ontario hospitals.</p>
      </header>

      <section className="disclaimer-banner glass-card">
        <AlertTriangle className="icon-error" />
        <p><strong>IMPORTANT:</strong> This is an informational tool only. If you are experiencing a life-threatening emergency, call 911 immediately. No medical advice is provided.</p>
      </section>

      <div className="controls">
        <button onClick={fetchData} className="btn-refresh">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh Data
        </button>
      </div>

      <div className="hospital-grid">
        <AnimatePresence>
          {data.map((item, index) => (
            <motion.div
              key={item.hospital.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card hospital-card"
            >
              <div className="card-header">
                <div>
                  <h3 className="hospital-name">{item.hospital.name}</h3>
                  <div className="hospital-meta">
                    <MapPin size={14} /> {item.hospital.address}
                  </div>
                </div>
                <div className={clsx('badge', `badge-${item.status.toLowerCase().replace('_', '-')}`)}>
                  {item.status.replace('_', ' ')} Confidence
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-label"><Clock size={16} /> Wait Time</div>
                  <div className="stat-value">
                    {item.latestRecord?.waitMinutes !== null
                      ? `${item.latestRecord?.waitMinutes} min`
                      : 'No Data Available'}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label"><Navigation size={16} /> Travel</div>
                  <div className="stat-value">{Math.round(item.travelMinutes)} min</div>
                </div>
                <div className="stat-item highlight">
                  <div className="stat-label">Total Time</div>
                  <div className="stat-value">{Math.round(item.score)} min</div>
                </div>
              </div>

              <div className="card-footer">
                <div className="freshness">
                  {item.latestRecord?.fetchedAt
                    ? `Last updated: ${new Date(item.latestRecord.fetchedAt).toLocaleTimeString()}`
                    : 'Wait time data currently unavailable'}
                </div>
                {item.latestRecord && (
                  <div className="parse-tag">
                    <Info size={12} /> Sourced from official portal
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }
        .hero {
          margin: 60px 0 40px;
          text-align: center;
        }
        .title {
          font-size: 3.5rem;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .subtitle {
          font-size: 1.25rem;
          color: #888;
        }
        .disclaimer-banner {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 40px;
          border-left: 4px solid var(--error);
          background: rgba(239, 68, 68, 0.05);
        }
        .icon-error { color: var(--error); flex-shrink: 0; }
        .controls {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }
        .btn-refresh {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--glass);
          border: 1px solid var(--glass-border);
          color: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .hospital-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }
        .hospital-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .hospital-name {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .hospital-meta {
          font-size: 0.85rem;
          color: #888;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1.2fr;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-label {
          font-size: 0.75rem;
          color: #666;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .stat-value {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .highlight .stat-value {
          color: var(--primary);
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          font-size: 0.75rem;
          color: #555;
        }
        .parse-tag {
          display: flex;
          align-items: center;
          gap: 4px;
        }
      `}} />
    </main>
  )
}
