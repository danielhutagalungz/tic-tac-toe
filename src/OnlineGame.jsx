import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  doc,
  onSnapshot,
  runTransaction,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Board, WinModal, calculateWinner } from "./Game";
import SideRays from "./components/SideRays";

function getClientId() {
  let id = localStorage.getItem("ttt-client-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ttt-client-id", id);
  }
  return id;
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function OnlineGame({ onBack = () => {} }) {
  const [roomCode, setRoomCode] = useState(
    () => new URLSearchParams(window.location.search).get("room") || "",
  );
  const [joinInput, setJoinInput] = useState("");
  const [game, setGame] = useState(null);
  const [mySymbol, setMySymbol] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const clientId = useRef(getClientId());
  const prevWinnerRef = useRef(null);
  const clickSoundRef = useRef(null);
  const victorySoundRef = useRef(null);

  useEffect(() => {
    clickSoundRef.current = new Audio("/sounds/faaah.mp3");
    victorySoundRef.current = new Audio("/sounds/victory.mp3");
  }, []);

  useEffect(() => {
    if (!roomCode) return;
    const unsub = onSnapshot(
      doc(db, "games", roomCode),
      (snap) => {
        if (!snap.exists()) {
          setError("Room tidak ditemukan.");
          setGame(null);
          return;
        }
        const data = snap.data();
        setGame(data);
        setError("");
        if (data.players?.X === clientId.current) setMySymbol("X");
        else if (data.players?.O === clientId.current) setMySymbol("O");
        else setMySymbol("spectator");
      },
      () => setError("Gagal terhubung ke room."),
    );
    return () => unsub();
  }, [roomCode]);

  useEffect(() => {
    if (!game) return;
    const winnerInfo = calculateWinner(game.squares);
    const winner = winnerInfo ? winnerInfo.winner : null;
    if (winner && winner !== prevWinnerRef.current) {
      victorySoundRef.current?.play().catch(() => {});
      setTimeout(() => setShowModal(true), 600);
    }
    prevWinnerRef.current = winner;
  }, [game]);

  async function createRoom() {
    const code = generateRoomCode();
    await runTransaction(db, async (tx) => {
      tx.set(doc(db, "games", code), {
        squares: Array(9).fill(null),
        xIsNext: true,
        playerXName: "Pemain X",
        playerOName: "Pemain O",
        players: { X: clientId.current, O: null },
        createdAt: serverTimestamp(),
      });
    });
    window.history.pushState({}, "", `?room=${code}`);
    setRoomCode(code);
  }

  async function joinRoom(code) {
    const upperCode = code.trim().toUpperCase();
    if (!upperCode) return;
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "games", upperCode);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Room tidak ditemukan.");
        const players = snap.data().players || { X: null, O: null };
        if (players.X === clientId.current || players.O === clientId.current)
          return;
        if (!players.X) tx.update(ref, { "players.X": clientId.current });
        else if (!players.O) tx.update(ref, { "players.O": clientId.current });
      });
      window.history.pushState({}, "", `?room=${upperCode}`);
      setRoomCode(upperCode);
    } catch (e) {
      setError(e.message || "Gagal join room.");
    }
  }

  async function handlePlay(nextSquares) {
    await updateDoc(doc(db, "games", roomCode), {
      squares: nextSquares,
      xIsNext: !game.xIsNext,
    });
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }
  }

  async function updateName(symbol, name) {
    const field = symbol === "X" ? "playerXName" : "playerOName";
    await updateDoc(doc(db, "games", roomCode), { [field]: name });
  }

  async function restartGame() {
    await updateDoc(doc(db, "games", roomCode), {
      squares: Array(9).fill(null),
      xIsNext: true,
    });
    setShowModal(false);
  }

  function leaveRoom() {
    window.history.pushState({}, "", window.location.pathname);
    setRoomCode("");
    setGame(null);
    setMySymbol(null);
  }

  function copyInviteLink() {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url).catch(() => {});
  }

  if (!roomCode) {
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
          <div className="page-header game-page-header">
            <button type="button" className="back-button" onClick={onBack}>
              ← Kembali
            </button>
          </div>

          <header className="game-header">
            <h1 className="game-title">TIC TAC TOE</h1>
            <p className="game-subtitle">Main Online</p>
          </header>

          <main className="game-main menu-main">
            <div className="glass-panel mode-panel">
              <p className="mode-eyebrow">Mode online</p>
              <p className="mode-description">
                Buat room baru atau masukkan kode untuk bermain bersama teman.
              </p>
              <button
                type="button"
                className="mode-button glow-button"
                onClick={createRoom}
              >
                Buat Room Baru
              </button>
              <div className="join-form">
                <input
                  className="join-input"
                  placeholder="Masukkan kode room"
                  value={joinInput}
                  onChange={(e) => setJoinInput(e.target.value)}
                  maxLength={5}
                />
                <button
                  type="button"
                  className="join-submit glow-button"
                  onClick={() => joinRoom(joinInput)}
                >
                  Gabung Room
                </button>
              </div>
              {error && <p className="error-text">{error}</p>}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!game) return <p>{error || "Menghubungkan ke room..."}</p>;

  const winnerInfo = calculateWinner(game.squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const isDraw = !winner && game.squares.every(Boolean);
  const isMyTurn =
    !winner &&
    !isDraw &&
    ((game.xIsNext && mySymbol === "X") || (!game.xIsNext && mySymbol === "O"));
  const gameFinished = Boolean(winner) || isDraw;

  return (
    <div className="game-wrapper">
      {showModal && winner && (
        <WinModal
          winnerName={winner === "X" ? game.playerXName : game.playerOName}
          winnerSymbol={winner}
          onClose={restartGame}
        />
      )}

      <SideRays
        className="side-rays-bg"
        speed={1.5}
        rayColor1="#00f2fe"
        rayColor2="#ec4899"
        intensity={1.8}
        spread={2.5}
        origin="top-right"
        tilt={5}
        saturation={1.6}
        blend={0.65}
        falloff={1.4}
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
          <p className="game-subtitle">
            Room <strong>{roomCode}</strong> — kamu sebagai{" "}
            {mySymbol === "spectator" ? "Penonton" : mySymbol}
          </p>
        </header>

        <main className="game-main">
          {/* Scoreboard */}
          <div className="scoreboard">
            <div
              className={`score-card player-x-card ${!winner && game.xIsNext && !isDraw ? "active" : ""} ${winner === "X" ? "winner-card" : ""}`}
            >
              <div className="player-avatar">X</div>
              <div className="player-details">
                <span className="player-label">Pemain X</span>
                <div className="player-name-row">
                  <input
                    className="player-name-input"
                    value={game.playerXName}
                    disabled={mySymbol !== "X"}
                    onChange={(e) => updateName("X", e.target.value)}
                    placeholder="Ketik nama di sini"
                    maxLength={12}
                  />
                  {mySymbol === "X" && (
                    <span className="name-edit-icon" aria-hidden="true">
                      ✎
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="vs-badge">
              <span className="vs-text">
                {winner ? "🎉" : isDraw ? "🤝" : "VS"}
              </span>
            </div>

            <div
              className={`score-card player-o-card ${!winner && !game.xIsNext && !isDraw ? "active" : ""} ${winner === "O" ? "winner-card" : ""}`}
            >
              <div className="player-avatar">O</div>
              <div className="player-details">
                <span className="player-label">Pemain O</span>
                <div className="player-name-row">
                  <input
                    className="player-name-input"
                    value={game.playerOName}
                    disabled={mySymbol !== "O"}
                    onChange={(e) => updateName("O", e.target.value)}
                    placeholder="Ketik nama di sini"
                    maxLength={12}
                  />
                  {mySymbol === "O" && (
                    <span className="name-edit-icon" aria-hidden="true">
                      ✎
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="game-layout">
            <div className="board-section">
              <Board
                xIsNext={game.xIsNext}
                squares={game.squares}
                onPlay={handlePlay}
                playerXName={game.playerXName}
                playerOName={game.playerOName}
                isReadOnly={!isMyTurn}
                onSound={() => {}}
              />
            </div>

            <div className="sidebar-section">
              <div className="glass-panel info-panel">
                <h2 className="panel-title">Info Room</h2>

                <div className="room-code-pill">
                  Kode Room: <strong>{roomCode}</strong>
                </div>

                <div className="room-actions">
                  <button
                    type="button"
                    className="action-button glow-button"
                    onClick={copyInviteLink}
                  >
                    Salin Link
                  </button>
                  <button
                    type="button"
                    className="action-button secondary"
                    onClick={leaveRoom}
                  >
                    Keluar Room
                  </button>
                </div>

                {gameFinished && (
                  <button
                    className="restart-button glow-button"
                    type="button"
                    onClick={restartGame}
                  >
                    Main Lagi
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}