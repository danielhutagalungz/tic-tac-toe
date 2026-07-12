import { useState } from "react";
import Game from "./Game";
import OnlineGame from "./OnlineGame";
import SideRays from "./components/SideRays";

export default function App() {
  const [mode, setMode] = useState(() =>
    new URLSearchParams(window.location.search).get("room") ? "online" : null,
  );

  function goHome() {
    window.history.pushState({}, "", window.location.pathname);
    setMode(null);
  }

  if (mode === "online") return <OnlineGame onBack={goHome} />;
  if (mode === "local") return <Game onBack={goHome} />;

  return (
    <div className="game-wrapper mode-screen">
      <SideRays
        className="side-rays-bg"
        speed={1.4}
        rayColor1="#00f2fe"
        rayColor2="#ec4899"
        intensity={1.8}
        spread={2.6}
        origin="top-right"
        tilt={6}
        saturation={1.5}
        blend={0.65}
        falloff={1.3}
        opacity={0.8}
      />

      <div className="game-container">
        <header className="game-header">
          <h1 className="game-title">TIC TAC TOE</h1>
          <p className="game-subtitle">Pilih mode permainan</p>
        </header>

        <main className="game-main menu-main">
          <div className="glass-panel mode-panel">
            <p className="mode-eyebrow">Pilih mode permainan</p>
            <p className="mode-description">
              Main bareng teman di satu layar atau tantang lawan online dengan
              room yang cepat dan simpel.
            </p>
            <div className="mode-actions">
              <button
                type="button"
                className="mode-button glow-button"
                onClick={() => setMode("local")}
              >
                Main Lokal
              </button>
              <button
                type="button"
                className="mode-button secondary glow-button"
                onClick={() => setMode("online")}
              >
                Main Online
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
