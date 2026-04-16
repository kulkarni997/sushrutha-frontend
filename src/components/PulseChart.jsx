import { useEffect, useState, useRef } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler)

export default function PulseChart() {
  const [bpm, setBpm] = useState(0)
  const [spo2, setSpo2] = useState(0)
  const [history, setHistory] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    const wsUrl = `ws://${window.location.hostname}:8000/ws/pulse`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onerror = () => setConnected(false)

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'pulse') {
          setBpm(msg.bpm)
          setSpo2(msg.spo2)
          setHistory((prev) => {
            const next = [...prev, msg.bpm]
            return next.slice(-30)
          })
        }
      } catch (e) {
        console.error('PulseChart parse error:', e)
      }
    }

    return () => ws.close()
  }, [])

  const data = {
    labels: history.map((_, i) => i),
    datasets: [
      {
        data: history,
        borderColor: '#C0392B',
        backgroundColor: 'rgba(192, 57, 43, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: {
        min: 40,
        max: 140,
        grid: { color: 'rgba(168, 152, 128, 0.1)' },
        ticks: { color: '#6B5E50', font: { size: 10 } },
      },
    },
  }

  return (
    <div className="w-full bg-surface border border-border rounded-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-2xl text-textMain">Live Pulse</h3>
        <span className={`text-xs font-mono ${connected ? 'text-neem' : 'text-hint'}`}>
          {connected ? '● connected' : '○ waiting...'}
        </span>
      </div>

      <div className="flex gap-8 mb-4">
        <div>
          <p className="text-hint text-xs font-sans uppercase tracking-wide">BPM</p>
          <p className="font-mono text-4xl text-primary">{bpm > 0 ? bpm.toFixed(0) : '--'}</p>
        </div>
        <div>
          <p className="text-hint text-xs font-sans uppercase tracking-wide">SpO₂</p>
          <p className="font-mono text-4xl text-neem">{spo2 > 0 ? `${spo2.toFixed(0)}%` : '--'}</p>
        </div>
      </div>

      <div className="h-32">
        <Line data={data} options={options} />
      </div>

      {!connected && (
        <p className="text-hint text-xs font-sans text-center mt-3">
          Place your finger on the sensor and ensure ESP32 is powered on.
        </p>
      )}
    </div>
  )
}