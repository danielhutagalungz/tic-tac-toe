import { useState, useEffect, useRef } from "react";
import SideRays from "./components/SideRays";

function SymbolX() {
  return (
    <svg
      className="symbol symbol-x"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <line
        x1="5"
        y1="5"
        x2="19"
        y2="19"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <line
        x1="19"
        y1="5"
        x2="5"
        y2="19"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SymbolO() {
  return (
    <svg
      className="symbol symbol-o"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}

function Square({
  value,
  onSquareClick,
  disabled,
  isWinning,
  position,
  hoverVariant,
}) {
  let className = "square";
  if (value === "X") className += " square-x square-filled";
  if (value === "O") className += " square-o square-filled";
  if (isWinning) className += " square-winner";
  if (!value && !disabled && hoverVariant === "x")
    className += " square-hover-x";
  if (!value && !disabled && hoverVariant === "o")
    className += " square-hover-o";

  const label = value
    ? `Kotak ${position}, berisi ${value}${isWinning ? ", bagian dari garis kemenangan" : ""}`
    : `Kotak ${position}, kosong`;

  return (
    <button
      type="button"
      className={className}
      onClick={onSquareClick}
      disabled={disabled}
      aria-label={label}
    >
      {value === "X" && <SymbolX />}
      {value === "O" && <SymbolO />}
    </button>
  );
}

function Board({
  xIsNext,
  squares,
  onPlay,
  playerXName,
  playerOName,
  isReadOnly,
  onSound,
}) {
  function handleClick(i) {
    if (isReadOnly || squares[i] || calculateWinner(squares)) {
      return;
    }

    onSound();
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";

    onPlay(nextSquares);
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : [];
  const isDraw = !winner && squares.every(Boolean);
  let status = "";

  if (isReadOnly) {
    status = "Melihat langkah sebelumnya";
  } else if (winner) {
    const winnerName = winner === "X" ? playerXName : playerOName;
    status = `Pemenang: ${winnerName} (${winner})`;
  } else if (isDraw) {
    status = "Permainan Seri";
  } else {
    const currentPlayerName = xIsNext ? playerXName : playerOName;
    status = `Giliran: ${currentPlayerName} (${xIsNext ? "X" : "O"})`;
  }

  const hoverVariant =
    !isReadOnly && !winner && !isDraw ? (xIsNext ? "x" : "o") : null;

  return (
    <div className="board-container">
      <div
        className={`status-badge ${winner ? `status-winner ${winner === "O" ? "status-winner-o" : ""}` : isDraw ? "status-draw" : "status-normal"}`}
      >
        {status}
      </div>

      <div
        className={`board ${winner === "X" ? "board-pulse-x" : winner === "O" ? "board-pulse-o" : ""}`}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Square
            key={i}
            value={squares[i]}
            onSquareClick={() => handleClick(i)}
            disabled={isReadOnly}
            isWinning={winningLine.includes(i)}
            position={i + 1}
            hoverVariant={hoverVariant}
          />
        ))}
      </div>
    </div>
  );
}

function WinModal({ winnerName, winnerSymbol, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-confetti">🎉</div>
        <h2 className="modal-title">Pemenangnya adalah</h2>
        <div
          className={`modal-winner-badge ${winnerSymbol === "X" ? "badge-x" : "badge-o"}`}
        >
          {winnerName} <span>({winnerSymbol})</span>
        </div>
        <img
          src="/images/042026c57dc3f0dedd7e1154fec2bbc5.jpg"
          alt="Kerja Bagus!"
          className="modal-image"
        />
        <button className="modal-btn glow-button" onClick={onClose}>
          Main Lagi
        </button>
      </div>
    </div>
  );
}

export default function Game({ onBack = () => {} }) {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [playerXName, setPlayerXName] = useState("Pemain X");
  const [playerOName, setPlayerOName] = useState("Pemain O");
  const [showModal, setShowModal] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];
  const winnerInfo = calculateWinner(currentSquares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const isDraw = !winner && currentSquares.every(Boolean);
  const gameFinished = Boolean(winner) || isDraw;
  const isReadOnly = currentMove !== history.length - 1;
  const historyScrollRef = useRef(null);
  const clickSoundRef = useRef(null);
  const victorySoundRef = useRef(null);

  // Pre-load audio ketika komponen pertama kali mount
  useEffect(() => {
    clickSoundRef.current = new Audio("/sounds/faaah.mp3");
    clickSoundRef.current.volume = 0.7;
    victorySoundRef.current = new Audio("/sounds/victory.mp3");
    victorySoundRef.current.volume = 0.8;
    return () => {
      clickSoundRef.current = null;
      victorySoundRef.current = null;
    };
  }, []);

  function playClickSound() {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }
  }

  // Putar suara victory dan tampilkan modal saat ada pemenang
  const prevWinnerRef = useRef(null);
  useEffect(() => {
    if (winner && winner !== prevWinnerRef.current) {
      if (victorySoundRef.current) {
        victorySoundRef.current.currentTime = 0;
        victorySoundRef.current.play().catch(() => {});
      }
      // Tunda modal sedikit agar animasi kemenangan di papan terlihat dulu
      setTimeout(() => setShowModal(true), 600);
    }
    prevWinnerRef.current = winner;
  }, [winner]);

  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTo({
        top: historyScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentMove]);

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function restartGame() {
    setHistory([Array(9).fill(null)]);
    setCurrentMove(0);
    setShowModal(false);
  }

  const moves = history.map((squares, move) => {
    let description = "";
    if (move > 0) {
      description = `Langkah #${move}`;
    } else {
      description = "Game Dimulai";
    }

    const isCurrent = move === currentMove;

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
      {showModal && winner && (
        <WinModal
          winnerName={winner === "X" ? playerXName : playerOName}
          winnerSymbol={winner}
          onClose={restartGame}
        />
      )}
      {/* Background — memenuhi seluruh layar, di belakang semua konten */}
      <SideRays
        className="side-rays-bg"
        speed={1.5}
        rayColor1="#4de082"
        rayColor2="#8bd6b4"
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
          <p className="game-subtitle">Menangkan Gamenya !</p>
        </header>

        <main className="game-main">
          {/* Scoreboard / Player Setup */}
          <div className="scoreboard">
            <div
              className={`score-card player-x-card ${!winner && xIsNext && !isReadOnly && !isDraw ? "active" : ""} ${winner === "X" ? "winner-card" : ""}`}
            >
              <div className="player-avatar">X</div>
              <div className="player-details">
                <span className="player-label">Pemain X</span>
                <div className="player-name-row">
                  <input
                    className="player-name-input"
                    value={playerXName}
                    onChange={(event) => setPlayerXName(event.target.value)}
                    placeholder="Ketik nama di sini"
                    maxLength={12}
                  />
                  <span className="name-edit-icon" aria-hidden="true">
                    ✎
                  </span>
                </div>
              </div>
            </div>

            <div className="vs-badge">
              <span className="vs-text">
                {winner ? "🎉" : isDraw ? "🤝" : "VS"}
              </span>
            </div>

            <div
              className={`score-card player-o-card ${!winner && !xIsNext && !isReadOnly && !isDraw ? "active" : ""} ${winner === "O" ? "winner-card" : ""}`}
            >
              <div className="player-avatar">O</div>
              <div className="player-details">
                <span className="player-label">Pemain O</span>
                <div className="player-name-row">
                  <input
                    className="player-name-input"
                    value={playerOName}
                    onChange={(event) => setPlayerOName(event.target.value)}
                    placeholder="Ketik nama di sini"
                    maxLength={12}
                  />
                  <span className="name-edit-icon" aria-hidden="true">
                    ✎
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="game-layout">
            <div className="board-section">
              <Board
                xIsNext={xIsNext}
                squares={currentSquares}
                onPlay={handlePlay}
                playerXName={playerXName}
                playerOName={playerOName}
                isReadOnly={isReadOnly}
                onSound={playClickSound}
              />
              {isReadOnly && (
                <button
                  type="button"
                  className="action-button glow-button back-to-live-button"
                  onClick={() => jumpTo(history.length - 1)}
                >
                  ↺ Kembali ke Langkah Terbaru
                </button>
              )}
            </div>

            <div className="sidebar-section">
              <div className="glass-panel info-panel">
                <h2 className="panel-title">Riwayat Langkah</h2>
                <div className="history-scroll" ref={historyScrollRef}>
                  <ol className="history-timeline">{moves}</ol>
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

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }

  return null;
}

export { Board, WinModal, calculateWinner, SymbolX, SymbolO };