import { useState, useEffect, useRef } from "react";
import SideRays from "./components/SideRays";

function Square({ value, onSquareClick, disabled, isWinning }) {
  let className = "square";
  if (value === "X") className += " square-x";
  if (value === "O") className += " square-o";
  if (isWinning) className += " square-winner";

  return (
    <button
      type="button"
      className={className}
      onClick={onSquareClick}
      disabled={disabled}
    >
      <span className="square-inner">{value}</span>
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
    status = `Pemenang: ${winnerName} (${winner}) 🎉`;
  } else if (isDraw) {
    status = "Permainan Seri! 🤝";
  } else {
    const currentPlayerName = xIsNext ? playerXName : playerOName;
    status = `Giliran: ${currentPlayerName} (${xIsNext ? "X" : "O"})`;
  }

  return (
    <div className="board-container">
      <div className={`status-badge ${winner ? "status-winner" : isDraw ? "status-draw" : "status-normal"}`}>
        {status}
      </div>

      <div className="board">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Square
            key={i}
            value={squares[i]}
            onSquareClick={() => handleClick(i)}
            disabled={isReadOnly}
            isWinning={winningLine.includes(i)}
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
        <div className={`modal-winner-badge ${winnerSymbol === 'X' ? 'badge-x' : 'badge-o'}`}>
          {winnerName} <span>({winnerSymbol})</span>
        </div>
        <img
          src="/images/042026c57dc3f0dedd7e1154fec2bbc5.jpg"
          alt="Kerja Bagus!"
          className="modal-image"
        />
        <button className="modal-btn glow-button" onClick={onClose}>
          Main Lagi 🚀
        </button>
      </div>
    </div>
  );
}

export default function Game() {
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
      <li key={move} className={`timeline-item ${isCurrent ? "active-item" : ""}`}>
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
          winnerName={winner === 'X' ? playerXName : playerOName}
          winnerSymbol={winner}
          onClose={restartGame}
        />
      )}
      {/* Background — memenuhi seluruh layar, di belakang semua konten */}
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
        <header className="game-header">
          <h1 className="game-title">TIC TAC TOE</h1>
          <p className="game-subtitle">Menangkan Gamenya !</p>
        </header>

        <div className="game-main">
          {/* Scoreboard / Player Setup */}
          <div className="scoreboard">
            <div className={`score-card player-x-card ${(!winner && xIsNext && !isReadOnly && !isDraw) ? 'active' : ''} ${winner === 'X' ? 'winner-card' : ''}`}>
              <div className="player-avatar">X</div>
              <div className="player-details">
                <span className="player-label">Pemain X</span>
                <input
                  className="player-name-input"
                  value={playerXName}
                  onChange={(event) => setPlayerXName(event.target.value)}
                  placeholder="Nama Pemain X"
                  maxLength={12}
                />
              </div>
            </div>

            <div className="vs-badge">
              <span className="vs-text">{winner ? "🎉" : isDraw ? "🤝" : "VS"}</span>
            </div>

            <div className={`score-card player-o-card ${(!winner && !xIsNext && !isReadOnly && !isDraw) ? 'active' : ''} ${winner === 'O' ? 'winner-card' : ''}`}>
              <div className="player-avatar">O</div>
              <div className="player-details">
                <span className="player-label">Pemain O</span>
                <input
                  className="player-name-input"
                  value={playerOName}
                  onChange={(event) => setPlayerOName(event.target.value)}
                  placeholder="Nama Pemain O"
                  maxLength={12}
                />
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
            </div>

            <div className="sidebar-section">
              <div className="glass-panel info-panel">
                <h3 className="panel-title">Riwayat Langkah</h3>
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
        </div>
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