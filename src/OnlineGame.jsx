import { useState, useEffect, useRef } from "react";
import { db } from "./firebase";
import {
  doc,
  onSnapshot,
  runTransaction,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { Board, calculateWinner } from "./Game";
import SideRays from "./components/SideRays";
import { useAuth } from "./UserAuth";

function ResultModal({ result, displayName, displaySymbol, onClose }) {
  let emoji = "🎉";
  let title = "Kamu Menang!";
  let imageSrc = "/images/042026c57dc3f0dedd7e1154fec2bbc5.jpg";
  let imageAlt = "Kerja Bagus!";

  if (result === "draw") {
    emoji = "🤝";
    title = "Permainan Seri!";
    imageSrc = "/images/6dbc1c77003c177d25c72f50abbdf646.jpg";
    imageAlt = "Permainan Seri";
  } else if (result === "lose") {
    emoji = "😢";
    title = "Kamu Kalah";
    imageSrc = "/images/cd4af7e68627a80c8d4156c9595d2978.jpg";
    imageAlt = "Kamu Kalah";
  } else if (result === "spectator") {
    emoji = "🎉";
    title = "Permainan Selesai";
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-confetti">{emoji}</div>
        <h2 className="modal-title">{title}</h2>
        {result !== "draw" && (
          <div
            className={`modal-winner-badge ${displaySymbol === "X" ? "badge-x" : "badge-o"}`}
          >
            {displayName} <span>({displaySymbol})</span>
          </div>
        )}
        <img src={imageSrc} alt={imageAlt} className="modal-image" />
        <button className="modal-btn glow-button" onClick={onClose}>
          Main Lagi
        </button>
      </div>
    </div>
  );
}

function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++)
    code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function OnlineGame({
  onBack = () => {},
  roomCode,
  onRoomChange,
  onOpenLeaderboard = () => {},
}) {
  const {
    user,
    loading: authLoading,
    error: authError,
    signIn,
    signOut,
  } = useAuth();
  const [joinInput, setJoinInput] = useState("");
  const [game, setGame] = useState(null);
  const [mySymbol, setMySymbol] = useState(null);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [viewMove, setViewMove] = useState(0);
  const isFollowingLatestRef = useRef(true);
  const prevGameOverRef = useRef(false);
  const autoJoinAttemptedRef = useRef(false);
  const clickSoundRef = useRef(null);
  const victorySoundRef = useRef(null);
  const drawSoundRef = useRef(null);
  const loseSoundRef = useRef(null);

  useEffect(() => {
    clickSoundRef.current = new Audio("/sounds/faaah.mp3");
    victorySoundRef.current = new Audio("/sounds/victory.mp3");
    drawSoundRef.current = new Audio("/sounds/wrong-answer-sound-effect.mp3");
    loseSoundRef.current = new Audio("/sounds/sadtrombone.swf.mp3");
  }, []);

  useEffect(() => {
    if (!roomCode) {
      setGame(null);
      setMySymbol(null);
      setError("");
      setShowModal(false);
      setViewMove(0);
      isFollowingLatestRef.current = true;
      prevGameOverRef.current = false;
      autoJoinAttemptedRef.current = false;
      return;
    }
    const unsub = onSnapshot(
      doc(db, "games", roomCode),
      (snap) => {
        if (!snap.exists()) {
          setError("Room tidak ditemukan.");
          setGame(null);
          return;
        }
        const data = snap.data();
        // Dukung dokumen lama yang belum punya field `history`.
        const history = data.history || [{ squares: data.squares }];
        setGame({ ...data, history });
        setError("");
        if (data.players?.X === user?.uid) setMySymbol("X");
        else if (data.players?.O === user?.uid) setMySymbol("O");
        else setMySymbol("spectator");

        // Kalau baru saja main lagi (restart), atau kita memang lagi
        // "mengikuti" langkah terbaru, ikut lompat ke langkah terbaru.
        setViewMove((prev) => {
          if (history.length === 1) return 0;
          if (isFollowingLatestRef.current || prev >= history.length) {
            return history.length - 1;
          }
          return prev;
        });
      },
      () => setError("Gagal terhubung ke room."),
    );
    return () => unsub();
  }, [roomCode, user]);

  useEffect(() => {
    if (!game) return;
    const winnerInfo = calculateWinner(game.squares);
    const winner = winnerInfo ? winnerInfo.winner : null;
    const isDraw = !winner && game.squares.every(Boolean);
    const gameOver = Boolean(winner) || isDraw;

    if (gameOver && !prevGameOverRef.current) {
      if (winner && winner === mySymbol) {
        victorySoundRef.current?.play().catch(() => {});
      } else if (isDraw) {
        drawSoundRef.current?.play().catch(() => {});
      } else if (winner && mySymbol !== "spectator") {
        loseSoundRef.current?.play().catch(() => {});
      }
      if (roomCode) recordStatsOnce(roomCode);
      setTimeout(() => setShowModal(true), 600);
    }
    prevGameOverRef.current = gameOver;
  }, [game, mySymbol, roomCode]);

  // Kalau orang buka link undangan langsung (bukan lewat form "Gabung
  // Room"), dia belum terdaftar di `players` — auto-join-kan sekali,
  // selama masih ada slot X/O kosong. Kalau room sudah penuh, biarkan saja
  // (nanti ditangani sebagai "Room Penuh" di bagian render).
  useEffect(() => {
    if (!user || !game || autoJoinAttemptedRef.current) return;
    if (mySymbol !== "spectator") return;
    const hasOpenSlot = !game.players?.X || !game.players?.O;
    if (!hasOpenSlot) return;
    autoJoinAttemptedRef.current = true;
    joinRoom(roomCode);
  }, [user, game, mySymbol, roomCode]);

  async function createRoom() {
    const code = generateRoomCode();
    await runTransaction(db, async (tx) => {
      tx.set(doc(db, "games", code), {
        squares: Array(9).fill(null),
        history: [{ squares: Array(9).fill(null) }],
        xIsNext: true,
        playerXName: user.displayName || "Pemain X",
        playerOName: "Pemain O",
        players: { X: user.uid, O: null },
        statsRecorded: false,
        createdAt: serverTimestamp(),
      });
    });
    onRoomChange(code);
  }

  async function joinRoom(code) {
    const upperCode = code.trim().toUpperCase();
    if (!upperCode) return;
    try {
      await runTransaction(db, async (tx) => {
        const ref = doc(db, "games", upperCode);
        const snap = await tx.get(ref);
        if (!snap.exists()) throw new Error("Room tidak ditemukan.");
        const data = snap.data();
        const players = data.players || { X: null, O: null };
        if (players.X === user.uid || players.O === user.uid) return;
        if (!players.X) {
          tx.update(ref, {
            "players.X": user.uid,
            playerXName: user.displayName || "Pemain X",
          });
        } else if (!players.O) {
          tx.update(ref, {
            "players.O": user.uid,
            playerOName: user.displayName || "Pemain O",
          });
        } else {
          throw new Error("ROOM_FULL");
        }
      });
      if (upperCode !== roomCode) onRoomChange(upperCode);
    } catch (e) {
      if (e.message === "ROOM_FULL") {
        setError("Room sudah penuh (maksimal 2 pemain).");
      } else {
        setError(e.message || "Gagal join room.");
      }
    }
  }

  async function handlePlay(nextSquares) {
    const nextHistory = [
      ...(game.history || [{ squares: game.squares }]),
      { squares: nextSquares },
    ];
    isFollowingLatestRef.current = true;
    await updateDoc(doc(db, "games", roomCode), {
      squares: nextSquares,
      history: nextHistory,
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

  // Mencatat hasil game ke koleksi "leaderboard", sekali per game selesai.
  // Dipanggil dari KEDUA klien (X maupun O) begitu game berakhir, tapi
  // transaction + flag `statsRecorded` menjamin cuma salah satu yang
  // berhasil menulis — mencegah kemenangan/kekalahan tercatat dobel.
  async function recordStatsOnce(code) {
    const gameRef = doc(db, "games", code);
    try {
      await runTransaction(db, async (tx) => {
        const gameSnap = await tx.get(gameRef);
        if (!gameSnap.exists()) return;
        const data = gameSnap.data();
        if (data.statsRecorded) return;

        const winnerInfo = calculateWinner(data.squares);
        const winnerSymbol = winnerInfo ? winnerInfo.winner : null;
        const isDrawResult = !winnerSymbol && data.squares.every(Boolean);
        if (!winnerSymbol && !isDrawResult) return;

        const xUid = data.players?.X;
        const oUid = data.players?.O;
        const xRef = xUid ? doc(db, "leaderboard", xUid) : null;
        const oRef = oUid ? doc(db, "leaderboard", oUid) : null;

        // Semua read WAJIB dilakukan sebelum write di dalam transaction.
        const xSnap = xRef ? await tx.get(xRef) : null;
        const oSnap = oRef ? await tx.get(oRef) : null;

        function nextStats(snap, name, outcome) {
          const cur =
            snap && snap.exists()
              ? snap.data()
              : { wins: 0, losses: 0, draws: 0, gamesPlayed: 0 };
          return {
            displayName: name || cur.displayName || "Tanpa Nama",
            wins: (cur.wins || 0) + (outcome === "win" ? 1 : 0),
            losses: (cur.losses || 0) + (outcome === "loss" ? 1 : 0),
            draws: (cur.draws || 0) + (outcome === "draw" ? 1 : 0),
            gamesPlayed: (cur.gamesPlayed || 0) + 1,
            updatedAt: serverTimestamp(),
          };
        }

        if (isDrawResult) {
          if (xRef)
            tx.set(xRef, nextStats(xSnap, data.playerXName, "draw"), {
              merge: true,
            });
          if (oRef)
            tx.set(oRef, nextStats(oSnap, data.playerOName, "draw"), {
              merge: true,
            });
        } else {
          const xOutcome = winnerSymbol === "X" ? "win" : "loss";
          const oOutcome = winnerSymbol === "O" ? "win" : "loss";
          if (xRef)
            tx.set(xRef, nextStats(xSnap, data.playerXName, xOutcome), {
              merge: true,
            });
          if (oRef)
            tx.set(oRef, nextStats(oSnap, data.playerOName, oOutcome), {
              merge: true,
            });
        }

        tx.update(gameRef, { statsRecorded: true });
      });
    } catch {
      // Kalau gagal (misal ada race condition kecil), abaikan saja — gak
      // fatal, cuma berarti statistik ronde ini gak tercatat.
    }
  }

  async function restartGame() {
    isFollowingLatestRef.current = true;
    prevGameOverRef.current = false;
    // Tukar posisi X <-> O setiap ronde baru, beserta nama pemainnya —
    // supaya identitas orangnya ikut pindah simbol (bukan cuma simbolnya
    // doang yang berubah sementara nama "nyangkut" di posisi lama).
    const swappedPlayers = {
      X: game.players?.O ?? null,
      O: game.players?.X ?? null,
    };
    await updateDoc(doc(db, "games", roomCode), {
      squares: Array(9).fill(null),
      history: [{ squares: Array(9).fill(null) }],
      xIsNext: true,
      players: swappedPlayers,
      playerXName: game.playerOName,
      playerOName: game.playerXName,
      statsRecorded: false,
    });
    setShowModal(false);
  }

  function jumpTo(move) {
    isFollowingLatestRef.current = move === game.history.length - 1;
    setViewMove(move);
  }

  function backToLatest() {
    isFollowingLatestRef.current = true;
    setViewMove(game.history.length - 1);
  }

  if (authLoading) {
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
          <main className="game-main menu-main">
            <p className="mode-description">Memeriksa status login...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
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
            <p className="game-subtitle">Main Online</p>
          </header>

          <main className="game-main menu-main">
            <div className="glass-panel mode-panel">
              <p className="mode-eyebrow">Masuk dulu yuk</p>
              <p className="mode-description">
                Main online butuh login dengan Google — biar kemenangan kamu
                tercatat di leaderboard dan aman gak ketuker sama pemain lain.
              </p>
              <button
                type="button"
                className="mode-button glow-button"
                onClick={signIn}
              >
                Masuk dengan Google
              </button>
              {authError && <p className="error-text">{authError}</p>}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!roomCode) {
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
            <p className="game-subtitle">Main Online</p>
          </header>

          <main className="game-main menu-main">
            <div className="glass-panel mode-panel">
              <div className="account-bar">
                <span className="account-name">
                  Masuk sebagai <strong>{user.displayName}</strong>
                </span>
                <button
                  type="button"
                  className="account-signout"
                  onClick={signOut}
                >
                  Keluar Akun
                </button>
              </div>

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
              <button
                type="button"
                className="action-button secondary leaderboard-link-button"
                onClick={onOpenLeaderboard}
              >
                🏆 Lihat Leaderboard
              </button>
              {error && <p className="error-text">{error}</p>}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!game) return <p>{error || "Menghubungkan ke room..."}</p>;

  const history = game.history || [{ squares: game.squares }];
  const latestIndex = history.length - 1;
  const viewingLatest = viewMove === latestIndex;
  const displayedSquares = history[viewMove]?.squares || game.squares;

  const winnerInfo = calculateWinner(game.squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const isDraw = !winner && game.squares.every(Boolean);
  const bothPlayersPresent =
    Boolean(game.players?.X) && Boolean(game.players?.O);

  // Room sudah penuh dan kamu bukan salah satu dari 2 pemainnya (misal buka
  // link undangan setelah slotnya keburu terisi orang lain) — jangan
  // tampilkan papan permainan sama sekali.
  if (bothPlayersPresent && mySymbol === "spectator") {
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
            <p className="game-subtitle">Main Online</p>
          </header>
          <main className="game-main menu-main">
            <div className="glass-panel mode-panel">
              <p className="mode-eyebrow">Room {roomCode}</p>
              <p className="mode-description">
                🚫 Room ini sudah penuh (maksimal 2 pemain). Coba minta teman
                kamu buat room baru, atau gabung ke room lain.
              </p>
              <button
                type="button"
                className="mode-button glow-button"
                onClick={onBack}
              >
                Kembali ke Menu
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isMyTurn =
    bothPlayersPresent &&
    !winner &&
    !isDraw &&
    ((game.xIsNext && mySymbol === "X") || (!game.xIsNext && mySymbol === "O"));
  const gameFinished = Boolean(winner) || isDraw;

  let result = null;
  if (isDraw) result = "draw";
  else if (winner && mySymbol === "spectator") result = "spectator";
  else if (winner && winner === mySymbol) result = "win";
  else if (winner) result = "lose";

  const moves = history.map((_, move) => {
    const description = move > 0 ? `Langkah #${move}` : "Game Dimulai";
    const isCurrent = move === viewMove;
    return (
      <li
        key={move}
        className={`timeline-item ${isCurrent ? "active-item" : ""}`}
      >
        <button
          className={`move-button ${isCurrent ? "active-move" : ""}`}
          type="button"
          onClick={() => jumpTo(move)}
        >
          <span className="dot"></span>
          <span className="desc">{description}</span>
        </button>
      </li>
    );
  });

  return (
    <div className="game-wrapper">
      {showModal && gameFinished && (
        <ResultModal
          result={result}
          displayName={
            result === "lose"
              ? mySymbol === "X"
                ? game.playerXName
                : game.playerOName
              : winner === "X"
                ? game.playerXName
                : game.playerOName
          }
          displaySymbol={result === "lose" ? mySymbol : winner}
          onClose={restartGame}
        />
      )}

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
                {game.players?.O ? (
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
                ) : (
                  <span className="waiting-slot-text">Menunggu pemain...</span>
                )}
              </div>
            </div>
          </div>

          <div className="game-layout">
            <div className="board-section">
              {!bothPlayersPresent ? (
                <div className="board-container waiting-container">
                  <div className="status-badge status-waiting">
                    ⏳ Menunggu pemain kedua bergabung...
                  </div>
                  <div className="board waiting-board" aria-hidden="true">
                    {Array(9)
                      .fill(null)
                      .map((_, i) => (
                        <div key={i} className="square" />
                      ))}
                  </div>
                </div>
              ) : (
                <>
                  <Board
                    xIsNext={game.xIsNext}
                    squares={displayedSquares}
                    onPlay={handlePlay}
                    playerXName={game.playerXName}
                    playerOName={game.playerOName}
                    isReadOnly={!viewingLatest || !isMyTurn}
                    onSound={() => {}}
                  />
                  {!viewingLatest && (
                    <button
                      type="button"
                      className="action-button glow-button back-to-live-button"
                      onClick={backToLatest}
                    >
                      ↺ Kembali ke Langkah Terbaru
                    </button>
                  )}
                </>
              )}
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
                    className="action-button secondary"
                    onClick={onBack}
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

              <div className="glass-panel info-panel">
                <h2 className="panel-title">Riwayat Langkah</h2>
                <div className="history-scroll">
                  <ol className="history-timeline">{moves}</ol>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}