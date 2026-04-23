import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import ThemeToggle from "../components/ThemeToggle";

const IMAGE_URL =
  "https://www.news-medical.net/image-handler/ts/20210823101848/ri/673/picture/2021/8/shutterstock_656977798.jpg";

function FloatingCard({ style, children, isDark }) {
  const base = {
    background: isDark
      ? "rgba(28,20,12,0.75)"
      : "rgba(255,252,245,0.85)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: isDark
      ? "0.5px solid rgba(224,120,32,0.15)"
      : "0.5px solid rgba(59,42,26,0.12)",
    borderRadius: 12,
    padding: "14px 16px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  };
  return <div style={{ ...base, ...style }}>{children}</div>;
}

export default function HeroCSS3D({ onPatientClick, onDoctorClick }) {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [loaded, setLoaded] = useState(false);
  const heroRef = useRef();
  const { isDark } = useTheme();

  useEffect(() => {
    const handleMove = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMouse({ x, y });
    };
    const el = heroRef.current;
    el?.addEventListener("mousemove", handleMove);
    return () => el?.removeEventListener("mousemove", handleMove);
  }, []);

  const parallax = (depth) => ({
    transform: `translate(${mouse.x * depth}px, ${mouse.y * depth}px)`,
    transition: "transform 0.1s ease-out",
  });

  const tilt = {
    transform: `perspective(1000px) rotateY(${mouse.x * 6}deg) rotateX(${-mouse.y * 4}deg)`,
    transition: "transform 0.15s ease-out",
  };

  const t = isDark
    ? {
        section: "#0D0A06",
        overlay:
          "linear-gradient(108deg, rgba(13,10,6,0.82) 0%, rgba(13,10,6,0.5) 40%, rgba(13,10,6,0.15) 70%, rgba(13,10,6,0.05) 100%)",
        imgFilter: "saturate(1) brightness(0.85)",
        eyebrow: "rgba(240,192,64,1)",
        title: "#FFFFFF",
        em: "#FFA500",
        sub: "rgba(255,255,255,0.7)",
        btnGhostBorder: "rgba(245,237,214,0.12)",
        btnGhostText: "rgba(245,237,214,0.4)",
        navLogo: "#E07820",
        cardLabel: "rgba(245,237,214,0.28)",
        cardValue: "#F5EDD6",
        cardBpmUnit: "rgba(245,237,214,0.3)",
        cardRagText: "rgba(245,237,214,0.55)",
      }
    : {
        section: "#F0E8D8",
        overlay:
          "linear-gradient(108deg, rgba(240,232,216,0.88) 0%, rgba(240,232,216,0.6) 40%, rgba(240,232,216,0.2) 70%, rgba(240,232,216,0.05) 100%)",
        imgFilter: "saturate(0.8) brightness(1.1)",
        eyebrow: "rgba(150,80,0,0.8)",
        title: "#1A0E04",
        em: "#B85A00",
        sub: "rgba(26,14,4,0.6)",
        btnGhostBorder: "rgba(59,42,26,0.2)",
        btnGhostText: "rgba(59,42,26,0.5)",
        navLogo: "#B85A00",
        cardLabel: "rgba(59,42,26,0.4)",
        cardValue: "#2A1A08",
        cardBpmUnit: "rgba(59,42,26,0.4)",
        cardRagText: "rgba(59,42,26,0.6)",
      };

  return (
    <section
      ref={heroRef}
      style={{ ...styles.section, background: t.section, transition: "background 0.4s ease" }}
    >
      {/* Navbar */}
      <nav style={styles.nav}>
        <span
          style={{
            ...styles.navLogo,
            color: t.navLogo,
            fontFamily: "'Cormorant Garamond', serif",
          }}
        >
          Sushrutha AI
        </span>
        <ThemeToggle />
      </nav>

      <div style={{ ...styles.imgWrap, ...tilt }}>
        <img
          src={IMAGE_URL}
          alt="Ayurvedic herbs"
          style={{
            ...styles.img,
            opacity: loaded ? 1 : 0,
            filter: t.imgFilter,
            transition: "opacity 0.8s ease, filter 0.4s ease",
          }}
          onLoad={() => setLoaded(true)}
        />
      </div>

      <div
        style={{
          ...styles.overlay,
          background: t.overlay,
          transition: "background 0.4s ease",
        }}
      />

      <div style={{ ...styles.blob1, ...parallax(-12) }} />
      <div style={{ ...styles.blob2, ...parallax(-8) }} />

      <div style={{ ...styles.content, ...parallax(6) }}>
        <p
          style={{
            ...styles.eyebrow,
            color: t.eyebrow,
          }}
        >
          ✦ Sushrutha AI — Ayurvedic Intelligence
        </p>

        <h1 style={{ ...styles.title, color: t.title }}>
          Rooted in earth,
          <br />
          <em style={{ ...styles.em, color: t.em }}>guided by</em>
          <br />
          ancient science.
        </h1>

        <p
          style={{
            ...styles.sub,
            color: t.sub,
          }}
        >
          Your body speaks in signals. Tongue texture, voice resonance, and
          pulse rhythm — all decoded by AI against 5000 years of wisdom.
        </p>

        <div style={styles.btnRow}>
          <button style={styles.btnPrimary} onClick={onPatientClick}>
            Begin your scan →
          </button>
          <button
            style={{
              ...styles.btnGhost,
              border: `0.5px solid ${t.btnGhostBorder}`,
              color: t.btnGhostText,
            }}
            onClick={onDoctorClick}
          >
            BAMS Doctor portal
          </button>
        </div>
      </div>

      <div style={{ ...styles.cardArea, ...parallax(14) }}>
        <FloatingCard style={styles.cardDosha} isDark={isDark}>
          <p
            style={{
              ...cardLabel,
              color: t.cardLabel,
            }}
          >
            Dosha detected
          </p>
          <p
            style={{
              ...cardValue,
              color: t.cardValue,
            }}
          >
            Vata dominant
          </p>
          <div style={doshaBar}>
            <div
              style={{
                ...doshaFill,
                width: "62%",
                background: "#E07820",
              }}
            />
          </div>
          <div style={doshaBar}>
            <div
              style={{
                ...doshaFill,
                width: "26%",
                background: "#F0C040",
              }}
            />
          </div>
          <div style={doshaBar}>
            <div
              style={{
                ...doshaFill,
                width: "12%",
                background: "#2D5A27",
              }}
            />
          </div>
        </FloatingCard>

        <FloatingCard style={styles.cardPulse} isDark={isDark}>
          <p
            style={{
              ...cardLabel,
              color: t.cardLabel,
            }}
          >
            Live pulse · ESP32
          </p>
          <p
            style={{
              ...cardValue,
              color: "#2D5A27",
              fontSize: 42,
            }}
          >
            72{" "}
            <span
              style={{
                fontSize: 14,
                color: t.cardBpmUnit,
                fontWeight: 300,
              }}
            >
              BPM
            </span>
          </p>
          <svg width="100%" height="28" viewBox="0 0 120 28" style={{ marginTop: 6 }}>
            <polyline
              points="0,14 15,14 22,4 30,24 38,14 52,14 58,5 66,23 74,14 88,14 95,4 103,24 110,14 120,14"
              fill="none"
              stroke="#2D5A27"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </FloatingCard>

        <FloatingCard style={styles.cardRag} isDark={isDark}>
          <p
            style={{
              ...cardLabel,
              color: t.cardLabel,
            }}
          >
            From Charaka Samhita
          </p>
          <p
            style={{
              ...cardValue,
              fontSize: 15,
              lineHeight: 1.6,
              color: t.cardRagText,
              fontWeight: 300,
            }}
          >
            <span
              style={{
                fontSize: 14,
                display: "inline-block",
                marginBottom: 4,
              }}
            >
              Ashwagandha + Brahmi
            </span>
            <br />
            prescribed for Vata balance
          </p>
        </FloatingCard>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        @keyframes floatA {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes floatB {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        @keyframes floatC {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </section>
  );
}

const styles = {
  section: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    overflow: "hidden",
    cursor: "default",
  },
  nav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 40px",
  },
  navLogo: {
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },
  imgWrap: {
    position: "absolute",
    inset: "-5%",
    zIndex: 0,
    willChange: "transform",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: "center right",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
  },
  blob1: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(224,120,32,0.07) 0%, transparent 70%)",
    top: "10%",
    right: "20%",
    zIndex: 1,
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(45,90,39,0.08) 0%, transparent 70%)",
    bottom: "10%",
    right: "30%",
    zIndex: 1,
    pointerEvents: "none",
  },
  content: {
    position: "relative",
    zIndex: 2,
    padding: "0 6vw",
    maxWidth: 520,
    willChange: "transform",
  },
  eyebrow: {
    fontSize: 16,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    marginBottom: 24,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 400,
  },
  title: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: "clamp(56px, 7vw, 90px)",
    fontWeight: 300,
    lineHeight: 1.05,
    marginBottom: 20,
  },
  em: {
    fontStyle: "italic",
  },
  sub: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 20,
    fontWeight: 300,
    lineHeight: 1.9,
    marginBottom: 34,
    maxWidth: 380,
  },
  btnRow: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
  btnPrimary: {
    padding: "16px 32px",
    background: "#E07820",
    border: "none",
    borderRadius: 8,
    color: "#0D0A06",
    fontSize: 16,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  btnGhost: {
    padding: "16px 28px",
    background: "transparent",
    borderRadius: 8,
    fontSize: 16,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  cardArea: {
    position: "absolute",
    right: "4vw",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 3,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    willChange: "transform",
  },
  cardDosha: {
    animation: "floatA 5s ease-in-out infinite",
    width: 230,
  },
  cardPulse: {
    animation: "floatB 6s ease-in-out infinite",
    animationDelay: "1s",
    width: 230,
  },
  cardRag: {
    animation: "floatC 4.5s ease-in-out infinite",
    animationDelay: "2s",
    width: 230,
  },
};

const cardLabel = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 13,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  marginBottom: 6,
};

const cardValue = {
  fontFamily: "'Cormorant Garamond', serif",
  fontSize: 22,
  fontWeight: 400,
  marginBottom: 10,
};

const doshaBar = {
  height: 3,
  background: "rgba(245,237,214,0.06)",
  borderRadius: 2,
  marginBottom: 4,
  overflow: "hidden",
};

const doshaFill = {
  height: "100%",
  borderRadius: 2,
};