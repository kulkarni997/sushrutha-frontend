import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroCSS3D from "../components/HeroCSS3D";

export default function Home() {
  const navigate = useNavigate();

  return (
    <HeroCSS3D
      onPatientClick={() => navigate('/role')}
      onDoctorClick={() => navigate('/login?role=doctor')}
    />
  );
}
