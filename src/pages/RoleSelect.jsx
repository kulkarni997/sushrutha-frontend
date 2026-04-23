import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const BG_IMAGE = `url("https://www.news-medical.net/image-handler/ts/20210823101848/ri/673/picture/2021/8/shutterstock_656977798.jpg")`;


const dark = {
  page: { background: "#0D0A06" },
  overlay:
    "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(13,10,6,0.7) 0%, rgba(13,10,6,0.95) 100%)",
  nav: "linear-gradient(to bottom, rgba(13,10,6,0.8), transparent)",
  logo: "#E07820",
  back: "rgba(245,237,214,0.4)",
  eyebrow: "rgba(240,192,64,0.6)",
  title: "#F5EDD6",
  sub: "rgba(245,237,214,0.35)",
  card: "rgba(28,20,12,0.75)",
  cardBorder: "rgba(255,255,255,0.08)",
  cardTitle: "#F5EDD6",
  cardDesc: "rgba(245,237,214,0.4)",
  cardDivider: "rgba(255,255,255,0.06)",
  loginText: "rgba(245,237,214,0.3)",
  loginLink: "#E07820",
  toggleBg: "rgba(28,20,12,0.8)",
  toggleBorder: "rgba(255,255,255,0.1)",
  toggleIcon: "☀️",
  toggleColor: "rgba(245,237,214,0.5)",
  imgFilter: "saturate(0.6) brightness(0.3)",
};


const light = {
  page: { background: "#F5EDD6" },
  overlay:
    "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(245,237,214,0.6) 0%, rgba(245,237,214,0.92) 100%)",
  nav: "linear-gradient(to bottom, rgba(245,237,214,0.9), transparent)",
  logo: "#B85A00",
  back: "rgba(59,42,26,0.5)",
  eyebrow: "rgba(180,100,0,0.7)",
  title: "#2A1A08",
  sub: "rgba(59,42,26,0.5)",
  card: "rgba(255,252,245,0.85)",
  cardBorder: "rgba(59,42,26,0.12)",
  cardTitle: "#2A1A08",
  cardDesc: "rgba(59,42,26,0.55)",
  cardDivider: "rgba(59,42,26,0.08)",
  loginText: "rgba(59,42,26,0.45)",
  loginLink: "#B85A00",
  toggleBg: "rgba(255,252,245,0.9)",
  toggleBorder: "rgba(59,42,26,0.15)",
  toggleIcon: "🌙",
  toggleColor: "rgba(59,42,26,0.5)",
  imgFilter: "saturate(0.5) brightness(0.7)",
};


export default function RoleSelect() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [isDark, setIsDark] = useState(true);
  const t = isDark ? dark : light;


  return (
    <div style={{ ...s.page, ...t.page }}>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');`}
      </style>

      <div style={{ ...s.bgImg, backgroundImage: BG_IMAGE, filter: t.imgFilter }} />
      <div style={{ ...s.overlay, background: t.overlay }} />

      <nav style={{ ...s.nav, background: t.nav }}>
        <button onClick={() => navigate("/")} style={{ ...s.logo, color: t.logo }}>
          Sushrutha AI
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => setIsDark(!isDark)}
            style={{
              background: t.toggleBg,
              border: `0.5px solid ${t.toggleBorder}`,
              borderRadius: 20,
              padding: "5px 14px",
              cursor: "pointer",
              fontSize: 12,
              color: t.toggleColor,
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 6,
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
            }}
          >
            {t.toggleIcon} {isDark ? "Light mode" : "Dark mode"}
          </button>
          <button onClick={() => navigate("/")} style={{ ...s.back, color: t.back }}>
            ← Back
          </button>
        </div>
      </nav>

      <div style={s.content}>
        <p style={{ ...s.eyebrow, color: t.eyebrow }}>✦ Who are you?</p>
        <h1 style={{ ...s.title, color: t.title }}>Choose your path</h1>
        <p style={{ ...s.sub, color: t.sub }}>
          Tell us how you'll be using Sushrutha AI today.
        </p>

        <div style={s.cardsRow}>
          <div
            style={{
              ...s.card,
              background: t.card,
              border:
                hovered === "patient"
                  ? "1px solid rgba(224,120,32,0.6)"
                  : `1px solid ${t.cardBorder}`,
              boxShadow:
                hovered === "patient"
                  ? "0 0 60px rgba(224,120,32,0.12)"
                  : "0 8px 32px rgba(0,0,0,0.15)",
              transform:
                hovered === "patient"
                  ? "translateY(-6px) scale(1.02)"
                  : "translateY(0) scale(1)",
            }}
            onClick={() => navigate("/signup", { state: { role: "patient" } })}
            onMouseEnter={() => setHovered("patient")}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={s.cardIcon}>🌿</div>
            <h2 style={{ ...s.cardTitle, color: t.cardTitle }}>
              I'm here for myself
            </h2>
            <p style={{ ...s.cardDesc, color: t.cardDesc }}>
              Check your dosha from home. Tongue, voice, and pulse analysis
              powered by Ayurvedic AI.
            </p>
            <div style={{ ...s.cardDivider, background: t.cardDivider }} />
            <span
              style={{
                ...s.cardTag,
                color: "#E07820",
                borderColor: "rgba(224,120,32,0.3)",
              }}
            >
              For individuals
            </span>
            <div
              style={{
                ...s.cardArrow,
                opacity: hovered === "patient" ? 1 : 0,
                color: "#E07820",
              }}
            >
              Begin scan →
            </div>
          </div>

          <div
            style={{
              ...s.card,
              background: t.card,
              border:
                hovered === "doctor"
                  ? "1px solid rgba(45,90,39,0.6)"
                  : `1px solid ${t.cardBorder}`,
              boxShadow:
                hovered === "doctor"
                  ? "0 0 60px rgba(45,90,39,0.15)"
                  : "0 8px 32px rgba(0,0,0,0.15)",
              transform:
                hovered === "doctor"
                  ? "translateY(-6px) scale(1.02)"
                  : "translateY(0) scale(1)",
            }}
            onClick={() => navigate("/signup", { state: { role: "doctor" } })}
            onMouseEnter={() => setHovered("doctor")}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={s.cardIcon}>✦</div>
            <h2 style={{ ...s.cardTitle, color: t.cardTitle }}>I'm a BAMS Doctor</h2>
            <p style={{ ...s.cardDesc, color: t.cardDesc }}>
              Manage patients and walk-in clinic sessions with AI‑assisted
              Ayurvedic diagnostics.
            </p>
            <div style={{ ...s.cardDivider, background: t.cardDivider }} />
            <span
              style={{
                ...s.cardTag,
                color: "#2D5A27",
                borderColor: "rgba(45,90,39,0.4)",
              }}
            >
              For verified BAMS practitioners
            </span>
            <div
              style={{
                ...s.cardArrow,
                opacity: hovered === "doctor" ? 1 : 0,
                color: "#5a9e52",
              }}
            >
              Enter portal →
            </div>
          </div>
        </div>

        <p style={{ ...s.loginText, color: t.loginText }}>
          Already have an account?{" "}
          <span
            style={{ ...s.loginLink, color: t.loginLink }}
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}


const s = {
  page: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    fontFamily: "'DM Sans', sans-serif",
    transition: "background 0.4s ease",
  },
  bgImg: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    zIndex: 0,
    transition: "filter 0.4s ease",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    transition: "background 0.4s ease",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
    zIndex: 10,
    transition: "background 0.4s ease",
  },
  logo: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    background: "none",
    border: "none",
    cursor: "pointer",
    transition: "color 0.4s ease",
  },
  back: {
    fontSize: 13,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    transition: "color 0.4s ease",
  },
  content: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "100px 24px 60px",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    marginBottom: 16,
    fontWeight: 400,
    transition: "color 0.4s ease",
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 52,
    fontWeight: 300,
    lineHeight: 1.1,
    marginBottom: 12,
    transition: "color 0.4s ease",
  },
  sub: {
    fontSize: 14,
    fontWeight: 300,
    marginBottom: 52,
    transition: "color 0.4s ease",
  },
  cardsRow: {
    display: "flex",
    gap: 24,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 44,
  },
  card: {
    width: 280,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: 16,
    padding: "36px 28px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left",
  },
  cardIcon: { fontSize: 32, marginBottom: 20 },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 24,
    fontWeight: 400,
    marginBottom: 10,
    lineHeight: 1.2,
    transition: "color 0.4s ease",
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 1.8,
    fontWeight: 300,
    marginBottom: 20,
    flex: 1,
    transition: "color 0.4s ease",
  },
  cardDivider: {
    width: "100%",
    height: "0.5px",
    marginBottom: 16,
    transition: "background 0.4s ease",
  },
  cardTag: {
    fontSize: 10,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    border: "0.5px solid",
    borderRadius: 20,
    padding: "4px 12px",
    marginBottom: 12,
    fontWeight: 500,
  },
  cardArrow: {
    fontSize: 12,
    fontWeight: 500,
    marginTop: 4,
    transition: "opacity 0.3s ease",
    letterSpacing: "0.05em",
  },
  loginText: {
    fontSize: 13,
    fontWeight: 300,
    transition: "color 0.4s ease",
  },
  loginLink: {
    cursor: "pointer",
    fontWeight: 400,
    transition: "color 0.4s ease",
  },
};