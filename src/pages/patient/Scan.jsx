import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import SensorBanner from '../../components/SensorBanner'
import Spinner from '../../components/Spinner'

const LOADING_MESSAGES = [
  'Analysing tongue coating...',
  'Processing voice patterns...',
  'Computing your dosha...',
  'Generating herbal recipe...',
]

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center py-6">
      {[1, 2, 3, 4].map((n, i) => (
        <div key={n} className="flex items-center">
          <div
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              n <= step ? 'bg-turmeric' : 'bg-border'
            }`}
          />
          {i < 3 && (
            <div
              className={`w-10 h-px transition-colors duration-300 ${
                n < step ? 'bg-turmeric' : 'bg-border'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Step 1 — Symptoms ────────────────────────────────────────────────────────

function StepSymptoms({ symptoms, setSymptoms, onNext }) {
  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-cream mb-2">How are you feeling?</h1>
      <p className="font-sans text-sm text-muted mb-6">
        Describe your symptoms in your own words.
      </p>
      <textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value.slice(0, 500))}
        placeholder="e.g. I've been feeling bloated, tired, and my skin feels dry..."
        className="w-full bg-surface border border-border rounded-card px-4 py-3 text-cream text-sm font-sans placeholder:text-hint resize-none h-32 focus:outline-none focus:border-turmeric focus:ring-1 focus:ring-turmeric"
      />
      <p className="text-hint text-xs text-right mt-1">{symptoms.length}/500</p>
      <button
        onClick={onNext}
        disabled={symptoms.length < 20}
        className="bg-turmeric text-bg rounded-full px-8 py-3 text-sm font-sans mt-6 self-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
      >
        Continue
      </button>
    </div>
  )
}

// ─── Step 2 — Camera ──────────────────────────────────────────────────────────

function StepCamera({ capturedImage, setCapturedImage, onNext }) {
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
    const base64 = canvas.toDataURL('image/jpeg', 0.85)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCapturedImage(base64)
  }

  function retake() {
    setCapturedImage(null)
    setCameraReady(false)
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-cream mb-2">Take a tongue photo</h1>
      <p className="font-sans text-sm text-muted mb-6">
        Stick out your tongue in good lighting.
      </p>

      <div className="w-full max-w-sm mx-auto">
        {cameraError ? (
          <p className="text-kumkum text-sm text-center py-8">
            Camera access denied. Please allow camera in browser settings.
          </p>
        ) : capturedImage ? (
          <>
            <img
              src={capturedImage}
              alt="Captured tongue"
              className="w-full rounded-card border border-border"
            />
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={retake}
                className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans"
              >
                Retake
              </button>
              <button
                onClick={onNext}
                className="bg-turmeric text-bg rounded-full px-8 py-3 text-sm font-sans"
              >
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
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  cameraReady ? 'opacity-100' : 'opacity-0'
                }`}
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
                className="bg-turmeric text-bg rounded-full px-8 py-3 text-sm font-sans disabled:opacity-50 disabled:cursor-not-allowed"
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

// ─── Step 3 — Voice ───────────────────────────────────────────────────────────

function StepVoice({ audioBlob, setAudioBlob, onNext }) {
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

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
      }

      mr.start()
      setRecording(true)
      setCountdown(10)

      let secs = 10
      timerRef.current = setInterval(() => {
        secs -= 1
        setCountdown(secs)
        if (secs <= 0) {
          clearInterval(timerRef.current)
          mr.stop()
          setRecording(false)
        }
      }, 1000)
    })
  }

  function reRecord() {
    setAudioBlob(null)
    setCountdown(10)
  }

  const mins = String(Math.floor(countdown / 60)).padStart(1, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-cream mb-2">Record your voice</h1>
      <p className="font-sans text-sm text-muted mb-6">
        Speak for 10 seconds in Kannada, Hindi, or English.
      </p>

      <div className="flex flex-col items-center gap-4">
        {audioBlob ? (
          <>
            <span className="text-5xl text-neem">✓</span>
            <p className="text-neem text-sm font-sans">Recording complete</p>
            <div className="flex gap-3">
              <button
                onClick={reRecord}
                className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans"
              >
                Re-record
              </button>
              <button
                onClick={onNext}
                className="bg-turmeric text-bg rounded-full px-8 py-3 text-sm font-sans"
              >
                Continue
              </button>
            </div>
          </>
        ) : recording ? (
          <>
            <div className="w-16 h-16 rounded-full bg-kumkum animate-pulse" />
            <p className="font-mono text-4xl text-cream">{mins}:{secs}</p>
            <p className="text-muted text-sm font-sans">Recording...</p>
          </>
        ) : (
          <>
            <span className="text-5xl text-muted">🎙</span>
            <button
              onClick={startRecording}
              className="bg-turmeric text-bg rounded-full px-8 py-3 text-sm font-sans"
            >
              Start Recording
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Step 4 — Sensor ──────────────────────────────────────────────────────────

function StepSensor({ onChoose }) {
  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-cream mb-2">Connect pulse sensor</h1>
      <p className="font-sans text-sm text-muted mb-6">
        Optional: pair your ESP32 pulse sensor for heart-rate data.
      </p>

      <SensorBanner />

      <div className="flex flex-col items-center gap-4 mt-6">
        <button
          onClick={() => onChoose(true)}
          className="border border-neem text-neem rounded-full px-8 py-3 text-sm font-sans"
        >
          I have a sensor
        </button>
        <button
          onClick={() => onChoose(false)}
          className="text-muted text-sm font-sans underline cursor-pointer"
        >
          Skip for now
        </button>
      </div>
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Scan() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  usePlan()

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
      navigate('/results/mock-scan-id')
    }, 3000)
    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [diagnosing, navigate])

  function handleLogout() {
    logout()
    navigate('/')
  }

  function startDiagnosis() {
    setDiagnosing(true)
  }

  if (diagnosing) {
    return <DiagnosingScreen message={loadingMessage} />
  }

  return (
    <div className="min-h-screen bg-bg text-cream font-sans flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <span className="font-display text-turmeric text-xl tracking-widest">SUSHRUTHA AI</span>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-hint text-xs hover:text-kumkum transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Step indicator */}
      <StepIndicator step={step} />

      {/* Content */}
      <main className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        <div className="max-w-2xl w-full">
          {step === 1 && (
            <StepSymptoms
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <StepCamera
              capturedImage={capturedImage}
              setCapturedImage={setCapturedImage}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && (
            <StepVoice
              audioBlob={audioBlob}
              setAudioBlob={setAudioBlob}
              onNext={() => setStep(4)}
            />
          )}
          {step === 4 && (
            <StepSensor onChoose={startDiagnosis} />
          )}
        </div>
      </main>
    </div>
  )
}
