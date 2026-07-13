import { useState, useEffect, useRef, useCallback } from "react";
import Game from "./Game";
import OnlineGame from "./OnlineGame";
import SideRays from "./components/SideRays";

// Membaca mode & roomCode dari URL saat ini — dipakai sebagai "sumber
// kebenaran" tunggal, baik saat load pertama maupun saat tombol back/forward
// browser ditekan.
function readNavStateFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const room = params.get("room");
  const modeParam = params.get("mode");
  if (room) return { mode: "online", roomCode: room.toUpperCase() };
  if (modeParam === "local") return { mode: "local", roomCode: "" };
  if (modeParam === "online") return { mode: "online", roomCode: "" };
  return { mode: null, roomCode: "" };
}

export default function App() {
  const [{ mode, roomCode }, setNavState] = useState(readNavStateFromUrl);
  // Melacak berapa banyak "langkah maju" yang sudah kita dorong sendiri ke
  // history, supaya tombol "Kembali" tau apakah cukup panggil
  // history.back() (biar browser back button & tombol kita konsisten) atau,
  // kalau user datang langsung dari link undangan (tanpa history di app
  // ini), langsung arahkan ke Beranda.
  const pushDepthRef = useRef(0);

  useEffect(() => {
    function handlePopState() {
      if (pushDepthRef.current > 0) pushDepthRef.current -= 1;
      setNavState(readNavStateFromUrl());
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((next, { replace = false } = {}) => {
    const params = new URLSearchParams();
    if (next.roomCode) params.set("room", next.roomCode);
    else if (next.mode) params.set("mode", next.mode);
    const query = params.toString();
    const url = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    if (replace) {
      window.history.replaceState({ app: true, ...next }, "", url);
    } else {
      window.history.pushState({ app: true, ...next }, "", url);
      pushDepthRef.current += 1;
    }
    setNavState({ mode: next.mode, roomCode: next.roomCode || "" });
  }, []);

  // Dipakai oleh semua tombol "Kembali" / "Keluar Room": kalau ada history
  // yang kita dorong sendiri, mundur satu langkah lewat browser (supaya
  // tombol back browser & tombol di UI berperilaku sama persis). Kalau
  // tidak ada (misalnya user baru buka lewat link undangan), langsung ganti
  // ke Beranda tanpa menambah entry baru.
  const goBack = useCallback(() => {
    if (pushDepthRef.current > 0) {
      window.history.back();
    } else {
      navigate({ mode: null, roomCode: "" }, { replace: true });
    }
  }, [navigate]);

  if (mode === "online")
    return (
      <OnlineGame
        onBack={goBack}
        roomCode={roomCode}
        onRoomChange={(code) => navigate({ mode: "online", roomCode: code })}
      />
    );
  if (mode === "local") return <Game onBack={goBack} />;

  return (
    <div className="game-wrapper mode-screen">
      <SideRays
        className="side-rays-bg"
        speed={1.4}
        rayColor1="#00f0ff"
        rayColor2="#ff00e5"
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
                className="mode-button btn-plain"
                onClick={() => navigate({ mode: "local", roomCode: "" })}
              >
                Main Lokal
              </button>
              <button
                type="button"
                className="mode-button glow-button"
                onClick={() => navigate({ mode: "online", roomCode: "" })}
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
