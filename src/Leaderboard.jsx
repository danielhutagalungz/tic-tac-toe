import { useEffect, useState } from "react";
import { db } from "./firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import SideRays from "./components/SideRays";

export default function Leaderboard({ onBack = () => {} }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("wins", "desc"),
      limit(20),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setRows(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      () => {
        setError("Gagal memuat leaderboard.");
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  return (
    <div className="game-wrapper mode-screen">
      <SideRays
        className="side-rays-bg"
        speed={1.4}
        rayColor1="#4de082"
        rayColor2="#8bd6b4"
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
        <div className="page-header game-page-header">
          <button type="button" className="back-button" onClick={onBack}>
            ← Kembali
          </button>
        </div>

        <header className="game-header">
          <h1 className="game-title">TIC TAC TOE</h1>
          <p className="game-subtitle">🏆 Leaderboard</p>
        </header>

        <main className="game-main menu-main">
          <div className="glass-panel mode-panel leaderboard-panel">
            {loading && (
              <p className="mode-description">Memuat leaderboard...</p>
            )}
            {error && <p className="error-text">{error}</p>}
            {!loading && !error && rows.length === 0 && (
              <p className="mode-description">
                Belum ada data. Main dulu online biar masuk papan peringkat!
              </p>
            )}
            {!loading && rows.length > 0 && (
              <ol className="leaderboard-list">
                {rows.map((row, i) => (
                  <li
                    key={row.id}
                    className={`leaderboard-row ${i < 3 ? "top-rank" : ""}`}
                  >
                    <span className={`leaderboard-rank rank-${i + 1}`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <span className="leaderboard-name">
                      {row.displayName || "Tanpa Nama"}
                    </span>
                    <span className="leaderboard-stats">
                      <strong>{row.wins || 0}</strong> menang · {row.losses || 0}{" "}
                      kalah · {row.draws || 0} seri
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}