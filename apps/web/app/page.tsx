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
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${baseUrl}/api/recommendations?lat=${location.lat}&lng=${location.lng}`)
      const items = await res.json()
      setData(items)
    } catch (err) {
      console.error('Fetch failed', err)
    } finally {
      setLoading(false)
    }
  }

  const lastRefresh = data.length > 0
    ? new Date(Math.max(...data.map(d => d.latestRecord ? new Date(d.latestRecord.fetchedAt).getTime() : 0)))
    : null;

  return (
    <main className="container">
      <header className="hero">
        <h2 className="title">Smart ED Routing</h2>
        <p className="subtitle">Real-time wait times and optimized travel for Ontario hospitals.</p>
        {lastRefresh && (
          <div className="system-refresh">
            <RefreshCw size={14} /> System Refresh: {lastRefresh.toLocaleTimeString()}
          </div>
        )}
      </header>

      <section className="disclaimer-banner glass-card">
        <AlertTriangle className="icon-error" />
        <p><strong>IMPORTANT:</strong> This is an informational tool only. If you are experiencing a life-threatening emergency, call 911 immediately. No medical advice is provided.</p>
      </section>

      <div className="controls">
        <button onClick={fetchData} className="btn-refresh">
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          Refresh My View
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
              className={clsx('glass-card hospital-card', item.status === 'NO_DATA' && 'grayed-out')}
            >
              <div className="card-header">
                <div>
                  <h3 className="hospital-name">{item.hospital.name}</h3>
                  <div className="hospital-meta">
                    <MapPin size={14} /> {item.hospital.address}
                  </div>
                </div>
                <div className={clsx('badge', `badge-${item.status.toLowerCase().replace('_', '-')}`)}>
                  {item.status === 'NO_DATA' ? 'No Data Available' : `${item.status.replace('_', ' ')} Confidence`}
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-label"><Clock size={16} /> Wait Time</div>
                  <div className="stat-value">
                    {item.latestRecord?.waitMinutes !== null && item.latestRecord?.status === 'OK'
                      ? `${item.latestRecord?.waitMinutes} min`
                      : 'Unavailable'}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label"><Navigation size={16} /> Travel</div>
                  <div className="stat-value">{Math.round(item.travelMinutes)} min</div>
                </div>
                <div className="stat-item highlight">
                  <div className="stat-label">Total Time</div>
                  <div className="stat-value">
                    {item.status === 'NO_DATA' ? '—' : `${Math.round(item.score)} min`}
                  </div>
                </div>
              </div>

              {item.status === 'NO_DATA' && (
                <div className="no-data-alert">
                  <AlertTriangle size={14} /> This hospital's wait time source is currently unavailable.
                </div>
              )}

              <div className="card-footer">
                <div className="freshness">
                  {item.latestRecord?.fetchedAt && item.status !== 'NO_DATA'
                    ? `Sourced: ${new Date(item.latestRecord.fetchedAt).toLocaleTimeString()}`
                    : 'Wait time data currently unavailable'}
                </div>
                {item.latestRecord && item.status !== 'NO_DATA' && (
                  <div className="parse-tag">
                    <Info size={12} /> Sourced via {item.hospital.adapter_key}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      .system-refresh {
        margin - top: 16px;
      font-size: 0.85rem;
      color: #888;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
        }
      .grayed-out {
        opacity: 0.6;
      filter: grayscale(0.5);
      border-color: rgba(255, 255, 255, 0.05);
        }
      .no-data-alert {
        font - size: 0.8rem;
      color: var(--error);
      background: rgba(239, 68, 68, 0.05);
      padding: 8px 12px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
        }
      `}} />
    </main>
  )
}
