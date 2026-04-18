import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../api/axios'
import Spinner from '../../components/Spinner'
import {
  StepIndicator,
  StepSymptoms,
  StepCamera,
  StepVoice,
  StepSensor
} from '../patient/Scan'

const LOADING_MESSAGES = [
  'Analysing tongue coating...',
  'Processing voice patterns...',
  'Computing dosha profile...',
  'Generating herbal recipe...',
]

function DiagnosingScreen({ message }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center">
      <Spinner />
      <p className="font-sans text-sm text-muted mt-4">{message}</p>
    </div>
  )
}

export default function WalkinIntake() {
  const { id: sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const [step, setStep] = useState(1)
  const [symptoms, setSymptoms] = useState('')
  const [capturedImage, setCapturedImage] = useState(null)
  const [audioBlob, setAudioBlob] = useState(null)
  const [diagnosing, setDiagnosing] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [error, setError] = useState('')

  // Load session info on mount
  useEffect(() => {
    if (!sessionId) return
    api.get(`/doctor/walkin/${sessionId}`)
      .then(r => setSession(r.data))
      .catch(e => setLoadError(e.response?.data?.detail || 'Session not found'))
      .finally(() => setLoading(false))
  }, [sessionId])

  async function runDiagnosis(pulseUsed) {
    setDiagnosing(true)
    setError('')

    let idx = 0
    const interval = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[idx])
    }, 2500)

    try {
      // Base64 conversion
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

      // Call walk-in diagnose endpoint
      const res = await api.post('/guest/diagnose', {
        session_id: sessionId,
        symptoms_text: symptoms,
        image_data: imageData,
        audio_data: audioData,
        pulse_used: pulseUsed,
      })

      clearInterval(interval)

      if (res.data.result_id) {
        // After successful scan, go to doctor's walk-in session view
        navigate(`/doctor/walkin/${sessionId}/review`)
      } else {
        setError('Diagnosis completed but result could not be saved.')
        setDiagnosing(false)
      }
    } catch (e) {
      clearInterval(interval)
      console.error('Walk-in diagnosis error:', e)
      setError(e.response?.data?.detail || 'Something went wrong. Please try again.')
      setDiagnosing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-error font-sans text-sm">{loadError}</p>
        <button onClick={() => navigate('/doctor/walkin')} className="bg-primary text-bg rounded-full px-6 py-2 text-sm font-sans">
          Back to Walk-in
        </button>
      </div>
    )
  }

  if (diagnosing) return <DiagnosingScreen message={loadingMessage} />

  return (
    <div className="min-h-screen bg-bg text-textMain font-sans flex flex-col">
      {/* Walk-in mode header — different from patient nav */}
      <nav className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0 border-b border-border">
        <div>
          <p className="text-hint text-xs font-sans uppercase tracking-wider">Walk-in Session</p>
          <p className="font-display text-lg text-textMain">{session?.patient_name}</p>
        </div>
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="text-hint text-xs hover:text-muted transition-colors"
        >
          Exit session
        </button>
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