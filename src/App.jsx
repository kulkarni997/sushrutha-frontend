import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import ErrorBoundary from './components/ErrorBoundary.jsx'

import Home from './pages/Home.jsx'
import RoleSelect from './pages/RoleSelect.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Claim from './pages/Claim.jsx'
import NotFound from './pages/NotFound.jsx'
import Unauthorized from './pages/Unauthorized.jsx'

import Scan from './pages/patient/Scan.jsx'
import Results from './pages/patient/Results.jsx'
import Profile from './pages/patient/Profile.jsx'

import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx'
import DoctorWalkin from './pages/doctor/DoctorWalkin.jsx'
import DoctorPatient from './pages/doctor/DoctorPatient.jsx'
import DoctorMessages from './pages/doctor/DoctorMessages.jsx'
import DoctorAnalytics from './pages/doctor/DoctorAnalytics.jsx'

import Messages from './pages/shared/Messages.jsx'
import Notifications from './pages/shared/Notifications.jsx'
import Upgrade from './pages/Upgrade.jsx'

function PatientRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'patient') return <Navigate to="/unauthorized" replace />
  return children
}

function DoctorRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'doctor') return <Navigate to="/unauthorized" replace />
  return children
}

function AuthRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/role" element={<RoleSelect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/claim" element={<Claim />} />

        {/* Patient only */}
        <Route path="/scan" element={<PatientRoute><Scan /></PatientRoute>} />
        <Route path="/results/:scanId" element={<PatientRoute><Results /></PatientRoute>} />
        <Route path="/profile" element={<PatientRoute><Profile /></PatientRoute>} />

        {/* Doctor only */}
        <Route path="/doctor/dashboard" element={<DoctorRoute><DoctorDashboard /></DoctorRoute>} />
        <Route path="/doctor/walkin" element={<DoctorRoute><DoctorWalkin /></DoctorRoute>} />
        <Route path="/doctor/patient/:id" element={<DoctorRoute><DoctorPatient /></DoctorRoute>} />
        <Route path="/doctor/messages" element={<DoctorRoute><DoctorMessages /></DoctorRoute>} />
        <Route path="/doctor/analytics" element={<DoctorRoute><DoctorAnalytics /></DoctorRoute>} />

        {/* Shared authenticated */}
        <Route path="/messages/:threadId" element={<AuthRoute><Messages /></AuthRoute>} />
        <Route path="/notifications" element={<AuthRoute><Notifications /></AuthRoute>} />
        <Route path="/upgrade" element={<AuthRoute><Upgrade /></AuthRoute>} />

        {/* Fallback */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  )
}
