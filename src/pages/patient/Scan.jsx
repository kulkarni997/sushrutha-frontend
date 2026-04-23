import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import SensorBanner from '../../components/SensorBanner'
import Spinner from '../../components/Spinner'
import api from '../../api/axios'
import PulseChart from '../../components/PulseChart'

const LOADING_MESSAGES = [
  'Analysing tongue coating...',
  'Processing voice patterns...',
  'Computing your dosha...',
  'Generating herbal recipe...',
]

// ─── Step indicator ───────────────────────────────────────────────────────────

export function StepIndicator({ step }) {
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

// ─── Step 1 — Symptoms ────────────────────────────────────────────────────────

export function StepSymptoms({ symptoms, setSymptoms, onNext }) {
  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-textMain mb-2">How are you feeling?</h1>
      <p className="font-sans text-sm text-muted mb-6">Describe your symptoms in your own words.</p>
      <textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value.slice(0, 500))}
        placeholder="e.g. I've been feeling bloated, tired, and my skin feels dry..."
        className="w-full bg-surface border border-border rounded-card px-4 py-3 text-textMain text-sm font-sans placeholder:text-hint resize-none h-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
      <p className="text-hint text-xs text-right mt-1">{symptoms.length}/500</p>
      <button
        onClick={onNext}
        disabled={symptoms.length < 20}
        className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans mt-6 self-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
      >
        Continue
      </button>
    </div>
  )
}

// ─── Step 2 — Camera ──────────────────────────────────────────────────────────

export function StepCamera({ capturedImage, setCapturedImage, onNext }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const fileInputRef = useRef(null)
  const [cameraError, setCameraError] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [lowLight, setLowLight] = useState(false)
  const [mode, setMode] = useState('camera') // 'camera' or 'upload'

  useEffect(() => {
    if (capturedImage || mode === 'upload') return
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
  }, [capturedImage, mode])

  function checkBrightness(canvas) {
    const ctx = canvas.getContext('2d')
    const { width, height } = canvas
    const imageData = ctx.getImageData(width / 4, height / 4, width / 2, height / 2)
    const data = imageData.data
    let total = 0
    for (let i = 0; i < data.length; i += 4) {
      total += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
    return total / (data.length / 4)
  }

  function capture() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)

    const brightness = checkBrightness(canvas)
    if (brightness < 60) {
      setLowLight(true)
      return
    }

    setLowLight(false)
    const base64 = canvas.toDataURL('image/jpeg', 0.85)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCapturedImage(base64)
  }

  function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setCapturedImage(reader.result)
    reader.readAsDataURL(file)
  }

  function retake() {
    setCapturedImage(null)
    setCameraReady(false)
    setLowLight(false)
    if (mode === 'upload' && fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  function switchMode(m) {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCapturedImage(null)
    setCameraReady(false)
    setLowLight(false)
    setMode(m)
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-textMain mb-2">Take a tongue photo</h1>

      <div className="flex flex-col gap-1 mb-4">
        <p className="font-sans text-sm text-muted">Follow these steps for accurate results:</p>
        <div className="flex flex-col gap-1 mt-1">
          {[
            '1. Sit in bright natural or white light',
            '2. Open your mouth wide and stick out your tongue fully',
            '3. Hold still and tap Capture',
          ].map((tip) => (
            <p key={tip} className="font-sans text-xs text-hint">{tip}</p>
          ))}
        </div>
      </div>

      {/* Mode toggle */}
      {!capturedImage && (
        <div className="flex gap-2 mb-4 self-center">
          <button
            onClick={() => switchMode('camera')}
            className={`px-5 py-2 rounded-full text-sm font-sans transition-colors duration-200 ${mode === 'camera' ? 'bg-primary text-bg' : 'border border-border text-muted'}`}
          >
            📷 Camera
          </button>
          <button
            onClick={() => switchMode('upload')}
            className={`px-5 py-2 rounded-full text-sm font-sans transition-colors duration-200 ${mode === 'upload' ? 'bg-primary text-bg' : 'border border-border text-muted'}`}
          >
            🖼️ Upload Photo
          </button>
        </div>
      )}

      {lowLight && (
        <div className="mb-4 px-4 py-3 bg-surface border border-primary rounded-card flex items-center gap-2">
          <span className="text-lg">☀️</span>
          <p className="text-primary text-sm font-sans">Not enough light — move to a brighter area and retake.</p>
        </div>
      )}

      <div className="w-full max-w-sm mx-auto">
        {capturedImage ? (
          <>
            <img src={capturedImage} alt="Tongue" className="w-full rounded-card border border-border" />
            <div className="flex gap-3 justify-center mt-4">
              <button onClick={retake} className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans">Retake</button>
              <button onClick={onNext} className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans">Looks good</button>
            </div>
          </>
        ) : mode === 'upload' ? (
          <div
            className="w-full rounded-card border-2 border-dashed border-border bg-surface aspect-[4/3] flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary transition-colors duration-200"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-4xl">🖼️</span>
            <p className="font-sans text-sm text-muted">Tap to select a tongue photo</p>
            <p className="font-sans text-xs text-hint">JPG, PNG supported</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>
        ) : (
          <>
            {cameraError ? (
              <p className="text-error text-sm text-center py-8">Camera access denied. Please allow camera in browser settings.</p>
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
                  {cameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div
                        style={{
                          width: '55%',
                          paddingBottom: '35%',
                          borderRadius: '50%',
                          border: '3px solid #E8A020',
                          boxShadow: '0 0 0 9999px rgba(13,11,8,0.45)',
                          position: 'relative',
                        }}
                      />
                      <p
                        className="font-sans text-xs text-primary"
                        style={{ background: 'rgba(13,11,8,0.6)', marginTop: '10px', padding: '2px 10px', borderRadius: '999px' }}
                      >
                        Place tongue inside the oval
                      </p>
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
          </>
        )}
      </div>
    </div>
  )
}

// ─── Step 3 — Voice ───────────────────────────────────────────────────────────

export function StepVoice({ audioBlob, setAudioBlob, onNext }) {
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
        if (secs <= 0) { clearInterval(timerRef.current); mr.stop(); setRecording(false) }
      }, 1000)
    })
  }

  function reRecord() { setAudioBlob(null); setCountdown(10) }

  const mins = String(Math.floor(countdown / 60)).padStart(1, '0')
  const secs = String(countdown % 60).padStart(2, '0')

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-textMain mb-2">Record your voice</h1>
      <p className="font-sans text-sm text-muted mb-6">Speak for 10 seconds in Kannada, Hindi, or English.</p>
      <div className="flex flex-col items-center gap-4">
        {audioBlob ? (
          <>
            <span className="text-5xl text-neem">✓</span>
            <p className="text-neem text-sm font-sans">Recording complete</p>
            <div className="flex gap-3">
              <button onClick={reRecord} className="border border-border text-muted rounded-full px-6 py-2 text-sm font-sans">Re-record</button>
              <button onClick={onNext} className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans">Continue</button>
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
            <button onClick={startRecording} className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans">Start Recording</button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Step 4 — Sensor ──────────────────────────────────────────────────────────

export function StepSensor({ onChoose }) {
  const [showChart, setShowChart] = useState(false)

  if (showChart) {
    return (
      <div className="flex flex-col w-full">
        <h1 className="font-display text-4xl text-textMain mb-2">Live pulse reading</h1>
        <p className="font-sans text-sm text-muted mb-6">Place your finger on the sensor.</p>
        <PulseChart />
        <button
          onClick={() => onChoose(true)}
          className="bg-primary text-bg rounded-full px-8 py-3 text-sm font-sans mt-6 self-center"
        >
          Continue with diagnosis
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-display text-4xl text-textMain mb-2">Connect pulse sensor</h1>
      <p className="font-sans text-sm text-muted mb-6">Optional: pair your ESP32 pulse sensor for heart-rate data.</p>
      <SensorBanner />
      <div className="flex flex-col items-center gap-4 mt-6">
        <button onClick={() => setShowChart(true)} className="border border-neem text-neem rounded-full px-8 py-3 text-sm font-sans">I have a sensor</button>
        <button onClick={() => onChoose(false)} className="text-muted text-sm font-sans underline cursor-pointer">Skip for now</button>
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
  const [error, setError] = useState('')

  function handleLogout() { logout(); navigate('/') }

  async function runDiagnosis(pulseUsed) {
    setDiagnosing(true)
    setError('')

    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[idx])
    }, 2500)

    try {
      const scanRes = await api.post('/scans', {
        symptoms_text: symptoms,
        shared: false,
      })
      const scanId = scanRes.data.id

      let imageData = null
      if (capturedImage) {
        imageData = capturedImage.replace(/^data:image\/\w+;base64,/, '')
      }

      let audioData = null
      if (audioBlob) {
        audioData = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result.replace(/^data:.+;base64,/, ''))
          reader.readAsDataURL(audioBlob)
        })
      }

      const diagnoseRes = await api.post('/diagnose', {
        scan_id: scanId,
        symptoms_text: symptoms,
        image_data: imageData,
        audio_data: audioData,
        pulse_used: pulseUsed,
      })

      clearInterval(interval)

      if (diagnoseRes.data.result_id) {
        navigate(`/results/${scanId}`)
      } else {
        setError('Diagnosis completed but result could not be saved. Please try again.')
        setDiagnosing(false)
      }
    } catch (e) {
      clearInterval(interval)
      console.error('Diagnosis error:', e)
      setError(e.response?.data?.detail || 'Something went wrong. Please try again.')
      setDiagnosing(false)
    }
  }

  if (diagnosing) return <DiagnosingScreen message={loadingMessage} />

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans flex flex-col">
      <nav className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
        <span className="font-display text-primary text-xl tracking-widest">SUSHRUTHA AI</span>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{user?.name}</span>
          <button onClick={handleLogout} className="text-hint text-xs hover:text-error transition-colors duration-200">Logout</button>
        </div>
      </nav>

      <StepIndicator step={step} />

      {error && (
        <div className="mx-6 mb-2 px-4 py-3 bg-surface border border-error rounded-card">
          <p className="text-error text-sm font-sans">{error}</p>
        </div>
      )}

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-8">
        <div className="max-w-2xl w-full">
          {step === 1 && <StepSymptoms symptoms={symptoms} setSymptoms={setSymptoms} onNext={() => setStep(2)} />}
          {step === 2 && <StepCamera capturedImage={capturedImage} setCapturedImage={setCapturedImage} onNext={() => setStep(3)} />}
          {step === 3 && <StepVoice audioBlob={audioBlob} setAudioBlob={setAudioBlob} onNext={() => setStep(4)} />}
          {step === 4 && <StepSensor onChoose={runDiagnosis} />}
        </div>
      </main>
    </div>
  )
}