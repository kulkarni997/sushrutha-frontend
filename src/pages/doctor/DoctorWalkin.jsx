import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../../hooks/useAuth'
import Spinner from '../../components/Spinner'

// ─── Constants ────────────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  'Analysing tongue coating...',
  'Processing voice patterns...',
  'Computing your dosha...',
  'Generating herbal recipe...',
]

const MOCK_RESULT = {
  dominant: 'Vata',
  vata: 58,
  pitta: 28,
  kapha: 14,
  severity: 'mild',
}

const SEVERITY_CONFIG = {
  mild:     { bg: 'bg-neem/20',     border: 'border-neem',     text: 'text-neem',     label: '🌿 Mild imbalance detected — self-care recommended' },
  moderate: { bg: 'bg-primary/20', border: 'border-primary', text: 'text-primary', label: '⚠ Moderate imbalance — consult a doctor alongside these tips' },
  severe:   { bg: 'bg-error/20',   border: 'border-error',   text: 'text-error',   label: '🔴 Significant imbalance — please consult a BAMS doctor' },
}

const DOSHA_BAR_COLOR = { Vata: 'bg-primary', Pitta: 'bg-error', Kapha: 'bg-neem' }

// ─── Shared sub-components ────────────────────────────────────────────────────

function DoshaBar({ name, value, dominant }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="font-sans text-sm text-textMain">{name}</span>
          {dominant && (
            <span className="bg-primary/20 text-primary font-sans text-xs px-2 py-0.5 rounded-full">
              Dominant
            </span>
          )}
        </div>
        <span className="font-mono text-sm text-muted">{value}%</span>
      </div>
      <div className="w-full bg-bg rounded-full h-3 overflow-hidden">
        <div
          className={`${DOSHA_BAR_COLOR[name]} h-3 rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// ─── Intake steps ─────────────────────────────────────────────────────────────

function IntakeSymptoms({ symptoms, setSymptoms, onNext }) {
  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-5xl text-textMain mb-2">How are you feeling?</h1>
      <p className="font-sans text-sm text-muted mb-6">Describe your symptoms in your own words.</p>
      <textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value.slice(0, 500))}
        placeholder="e.g. I've been feeling bloated, tired, and my skin feels dry..."
        className="w-full bg-surface border border-border rounded-card px-4 py-3 text-textMain text-sm font-sans placeholder:text-hint resize-none h-36 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <p className="text-hint text-xs text-right mt-1">{symptoms.length}/500</p>
      <button
        onClick={onNext}
        disabled={symptoms.length < 20}
        className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans mt-6 self-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </div>
  )
}

function IntakeCamera({ capturedImage, setCapturedImage, onNext }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraError, setCameraError] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)

  useEffect(() => {
    if (capturedImage) return
    let active = true
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then((stream) => {
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => setCameraReady(true)
        }
      })
      .catch(() => setCameraError(true))
    return () => {
      active = false
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [capturedImage])

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.85))
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-5xl text-textMain mb-2">Take a tongue photo</h1>
      <p className="font-sans text-sm text-muted mb-6">Stick out your tongue in good lighting.</p>
      <div className="w-full max-w-sm mx-auto">
        {cameraError ? (
          <p className="text-error text-sm text-center py-8">
            Camera access denied. Please allow camera in browser settings.
          </p>
        ) : capturedImage ? (
          <>
            <img src={capturedImage} alt="Captured" className="w-full rounded-card border border-border" />
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => setCapturedImage(null)}
                className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans"
              >
                Retake
              </button>
              <button onClick={onNext} className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans">
                Looks good
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative w-full rounded-card border border-border overflow-hidden bg-surface aspect-[4/3] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-opacity duration-300 ${cameraReady ? 'opacity-100' : 'opacity-0'}`}
              />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Spinner />
                </div>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex justify-center mt-4">
              <button
                onClick={capture}
                disabled={!cameraReady}
                className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Capture
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function IntakeVoice({ audioBlob, setAudioBlob, onNext }) {
  const [recording, setRecording] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: 'audio/webm' }))
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      setRecording(true)
      setCountdown(10)
      let secs = 10
      timerRef.current = setInterval(() => {
        secs -= 1
        setCountdown(secs)
        if (secs <= 0) { clearInterval(timerRef.current); mr.stop(); setRecording(false) }
      }, 1000)
    })
  }

  const mins = String(Math.floor(countdown / 60)).padStart(1, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-5xl text-textMain mb-2">Record your voice</h1>
      <p className="font-sans text-sm text-muted mb-6">Speak for 10 seconds in Kannada, Hindi, or English.</p>
      <div className="flex flex-col items-center gap-4">
        {audioBlob ? (
          <>
            <span className="text-5xl text-neem">✓</span>
            <p className="text-neem text-sm font-sans">Recording complete</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setAudioBlob(null); setCountdown(10) }}
                className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans"
              >
                Re-record
              </button>
              <button onClick={onNext} className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans">
                Continue
              </button>
            </div>
          </>
        ) : recording ? (
          <>
            <div className="w-16 h-16 rounded-full bg-error animate-pulse" />
            <p className="font-mono text-4xl text-textMain">{mins}:{secs}</p>
            <p className="text-muted text-sm font-sans">Recording...</p>
          </>
        ) : (
          <>
            <span className="text-5xl text-muted">🎙</span>
            <button onClick={startRecording} className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans">
              Start Recording
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function IntakeSensor({ onDone }) {
  return (
    <div className="flex flex-col w-full items-center text-center">
      <h1 className="font-display text-5xl text-textMain mb-2">Connect pulse sensor</h1>
      <p className="font-sans text-sm text-muted mb-8">
        Place your finger on the sensor on the desk.
      </p>
      <span className="text-6xl mb-6">🫀</span>
      <p className="font-sans text-sm text-hint mb-8 max-w-xs">
        Hold still while the sensor reads your pulse. This takes about 15 seconds.
      </p>
      <button
        onClick={onDone}
        className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans"
      >
        Sensor Connected — Continue
      </button>
    </div>
  )
}

// ─── Step indicator (shared) ──────────────────────────────────────────────────

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center py-6">
      {[1, 2, 3, 4].map((n, i) => (
        <div key={n} className="flex items-center">
          <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${n <= step ? 'bg-primary' : 'bg-border'}`} />
          {i < 3 && <div className={`w-10 h-px transition-colors duration-300 ${n < step ? 'bg-primary' : 'bg-border'}`} />}
        </div>
      ))}
    </div>
  )
}

// ─── Diagnosing screen ────────────────────────────────────────────────────────

function DiagnosingScreen({ message }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
      <Spinner />
      <p className="font-sans text-sm text-muted mt-4">{message}</p>
    </div>
  )
}

// ─── MODE 1 — Doctor setup ────────────────────────────────────────────────────

function DoctorSetup({ patientName, setPatientName, onStart, onBack }) {
  return (
    <div className="min-h-screen bg-bg text-textMain font-sans flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <button
          onClick={onBack}
          className="text-muted hover:text-textMain text-sm font-sans mb-8 flex items-center gap-1 transition-colors duration-200"
        >
          ← Back
        </button>
        <h1 className="font-display text-4xl text-textMain mb-2">New Walk-in Session</h1>
        <p className="font-sans text-sm text-muted mb-8">Enter the patient&apos;s name to begin</p>

        <div className="mb-6">
          <label className="block text-xs text-hint font-sans tracking-widest uppercase mb-1">
            Patient Name
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Patient's full name"
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-textMain text-sm font-sans placeholder:text-hint focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
          />
        </div>

        <button
          onClick={onStart}
          disabled={patientName.trim().length < 2}
          className="w-full bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start Session
        </button>

        <p className="text-hint text-xs text-center mt-4">
          The device will switch to patient intake mode.
        </p>
      </div>
    </div>
  )
}

// ─── MODE 2 — Patient intake ──────────────────────────────────────────────────

function PatientIntake({ patientName, onComplete }) {
  const [step, setStep] = useState(1)
  const [symptoms, setSymptoms] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])

  useEffect(() => {
    if (!diagnosing) return
    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[idx])
    }, 2000)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      onComplete()
    }, 3000)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [diagnosing, onComplete])

  if (diagnosing) return <DiagnosingScreen message={loadingMessage} />

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans flex flex-col">
      <p className="text-hint text-xs text-center py-3">
        Walk-in session for {patientName}
      </p>
      <StepIndicator step={step} />
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        <div className="max-w-2xl w-full">
          {step === 1 && (
            <IntakeSymptoms symptoms={symptoms} setSymptoms={setSymptoms} onNext={() => setStep(2)} />
          )}
          {step === 2 && (
            <IntakeCamera capturedImage={capturedImage} setCapturedImage={setCapturedImage} onNext={() => setStep(3)} />
          )}
          {step === 3 && (
            <IntakeVoice audioBlob={audioBlob} setAudioBlob={setAudioBlob} onNext={() => setStep(4)} />
          )}
          {step === 4 && (
            <IntakeSensor onDone={() => setDiagnosing(true)} />
          )}
        </div>
      </main>
    </div>
  )
}

// ─── MODE 3 — Complete ────────────────────────────────────────────────────────

function SessionComplete({ patientName, onDashboard, onViewReport }) {
  const [showQR, setShowQR] = useState(false)
  const timestamp = new Date().toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
  const r = MOCK_RESULT
  const cfg = SEVERITY_CONFIG[r.severity]

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans">
      <div className="max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-4xl text-textMain mb-2">Session Complete</h1>
          <p className="font-sans text-sm text-muted">{patientName} &mdash; {timestamp}</p>
        </div>

        {/* Severity banner */}
        <div className={`${cfg.bg} ${cfg.border} ${cfg.text} border rounded-card p-4 font-sans text-sm`}>
          {cfg.label}
        </div>

        {/* Dosha bars */}
        <div className="bg-surface border border-border rounded-card p-6">
          <DoshaBar name="Vata"  value={r.vata}  dominant={r.dominant === 'Vata'}  />
          <DoshaBar name="Pitta" value={r.pitta} dominant={r.dominant === 'Pitta'} />
          <DoshaBar name="Kapha" value={r.kapha} dominant={r.dominant === 'Kapha'} />
        </div>

        {/* Action buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={onViewReport}
            className="bg-primary text-bg font-sans text-sm px-8 py-3 rounded-full hover:bg-accent transition-all duration-300"
          >
            View Full Report
          </button>
          <button
            onClick={() => setShowQR((v) => !v)}
            className="border border-primary text-primary font-sans text-sm px-8 py-3 rounded-full hover:bg-primary hover:text-bg transition-all duration-300"
          >
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </button>
        </div>

        {/* QR code */}
        {showQR && (
          <div className="flex flex-col items-center gap-3 bg-surface border border-border rounded-card p-8">
            <QRCodeSVG
              value="http://localhost:5173/claim?token=mock-token-123"
              size={200}
              bgColor="#1C1712"
              fgColor="#F5EDD6"
            />
            <p className="font-sans text-sm text-muted text-center mt-2">
              Patient can scan this to claim their report
            </p>
            <p className="font-sans text-xs text-hint">Valid for 48 hours</p>
          </div>
        )}

        {/* Back to dashboard */}
        <div className="flex justify-center">
          <button
            onClick={onDashboard}
            className="border border-border text-muted rounded-full px-8 py-3 text-sm font-sans"
          >
            Done — Back to Dashboard
          </button>
        </div>

      </div>
    </div>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function DoctorWalkin() {
  const navigate = useNavigate()
  useAuth()

  const [mode, setMode] = useState('doctor')
  const [patientName, setPatientName] = useState('')

  if (mode === 'doctor') {
    return (
      <DoctorSetup
        patientName={patientName}
        setPatientName={setPatientName}
        onStart={() => setMode('intake')}
        onBack={() => navigate('/doctor/dashboard')}
      />
    )
  }

  if (mode === 'intake') {
    return (
      <PatientIntake
        patientName={patientName}
        onComplete={() => setMode('complete')}
      />
    )
  }

  return (
    <SessionComplete
      patientName={patientName}
      onDashboard={() => navigate('/doctor/dashboard')}
      onViewReport={() => navigate('/doctor/patient/mock-id')}
    />
  )
}
