import { useState, useEffect, useRef } from "react";
import SideRays from "./components/SideRays";
import { WinModal, calculateWinner, SymbolX, SymbolO } from "./Game";

function emptyBoards() {
  return Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));
}

function initialSnapshot() {
  return {
    boards: emptyBoards(),
    boardWinners: Array(9).fill(null), // null | "X" | "O" | "draw"
    activeBoard: null, // null artinya bebas pilih papan manapun
    xIsNext: true,
    lastMove: null, // { board, cell }
  };
}

// Hasil keseluruhan (macro) — dihitung dari status tiap papan kecil.
function calculateOverallResult(snapshot) {
  const macroSymbols = snapshot.boardWinners.map((w) =>
    w === "X" || w === "O" ? w : null,
  );
  const macroInfo = calculateWinner(macroSymbols);
  const winner = macroInfo ? macroInfo.winner : null;
  const isDraw = !winner && snapshot.boardWinners.every((w) => w !== null);
  return {
    winner,
    line: macroInfo ? macroInfo.line : [],
    isDraw,
    finished: Boolean(winner) || isDraw,
  };
}

function MiniSquare({ value, onClick, disabled, isWinning }) {
  let className = "mini-square";
  if (value === "X") className += " mini-square-x";
  if (value === "O") className += " mini-square-o";
  if (isWinning) className += " mini-square-winning";
  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      disabled={disabled || Boolean(value)}
      aria-label={value ? `Berisi ${value}` : "Kotak kosong"}
    >
      {value === "X" && <SymbolX />}
      {value === "O" && <SymbolO />}
    </button>
  );
}

function MiniBoard({
  squares,
  status,
  isActive,
  isHighlighted,
  onCellClick,
}) {
  let className = "mini-board";
  if (status === "X") className += " mini-completed mini-completed-x";
  else if (status === "O") className += " mini-completed mini-completed-o";
  else if (status === "draw") className += " mini-completed mini-completed-draw";
  else if (isActive) className += " mini-active";
  else className += " mini-inactive";
  if (isHighlighted) className += " mini-winning-board";

  const winningLine = status === "X" || status === "O"
    ? calculateWinner(squares)?.line || []
    : [];

  return (
    <div className={className}>
      {status === "X" || status === "O" ? (
        <div className="mini-overlay" aria-hidden="true">
          {status === "X" ? <SymbolX /> : <SymbolO />}
        </div>
      ) : status === "draw" ? (
        <div className="mini-overlay mini-overlay-draw" aria-hidden="true">
          SERI
        </div>
      ) : (
        <div className="mini-grid">
          {squares.map((val, i) => (
            <MiniSquare
              key={i}
              value={val}
              isWinning={winningLine.includes(i)}
              disabled={!isActive}
              onClick={() => onCellClick(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function UltimateGame({ onBack = () => {} }) {
  const [history, setHistory] = useState([initialSnapshot()]);
  const [currentMove, setCurrentMove] = useState(0);
  const [playerXName, setPlayerXName] = useState("Pemain X");
  const [playerOName, setPlayerOName] = useState("Pemain O");
  const [showModal, setShowModal] = useState(false);
  const historyScrollRef = useRef(null);
  const clickSoundRef = useRef(null);
  const victorySoundRef = useRef(null);
  const prevFinishedRef = useRef(false);

  const snapshot = history[currentMove];
  const isReadOnly = currentMove !== history.length - 1;
  const result = calculateOverallResult(snapshot);

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

  useEffect(() => {
    if (result.finished && !prevFinishedRef.current) {
      if (result.winner && victorySoundRef.current) {
        victorySoundRef.current.currentTime = 0;
        victorySoundRef.current.play().catch(() => {});
      }
      setTimeout(() => setShowModal(true), 600);
    }
    prevFinishedRef.current = result.finished;
  }, [result.finished, result.winner]);

  useEffect(() => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollTo({
        top: historyScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [currentMove]);

  function playClickSound() {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(() => {});
    }
  }

  function handleCellClick(boardIndex, cellIndex) {
    if (isReadOnly || result.finished) return;
    if (snapshot.boardWinners[boardIndex]) return;
    if (snapshot.activeBoard !== null && snapshot.activeBoard !== boardIndex)
      return;
    if (snapshot.boards[boardIndex][cellIndex]) return;

    playClickSound();

    const symbol = snapshot.xIsNext ? "X" : "O";
    const newBoards = snapshot.boards.map((b, i) =>
      i === boardIndex
        ? b.map((c, j) => (j === cellIndex ? symbol : c))
        : b,
    );

    const subWinnerInfo = calculateWinner(newBoards[boardIndex]);
    const subDraw = !subWinnerInfo && newBoards[boardIndex].every(Boolean);
    const newBoardWinners = snapshot.boardWinners.map((w, i) =>
      i === boardIndex ? (subWinnerInfo ? subWinnerInfo.winner : subDraw ? "draw" : null) : w,
    );

    // Lawan wajib main di papan sesuai posisi kotak yang baru diisi, KECUALI
    // papan tujuan itu sudah selesai (menang/seri) — kalau begitu, bebas
    // pilih papan manapun yang masih terbuka.
    const newActiveBoard = newBoardWinners[cellIndex] ? null : cellIndex;

    const newSnapshot = {
      boards: newBoards,
      boardWinners: newBoardWinners,
      activeBoard: newActiveBoard,
      xIsNext: !snapshot.xIsNext,
      lastMove: { board: boardIndex, cell: cellIndex },
    };

    const nextHistory = [...history.slice(0, currentMove + 1), newSnapshot];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  function restartGame() {
    setHistory([initialSnapshot()]);
    setCurrentMove(0);
    setShowModal(false);
  }

  const activePlayerName = snapshot.xIsNext ? playerXName : playerOName;
  let statusText = "";
  if (isReadOnly) {
    statusText = "Melihat langkah sebelumnya";
  } else if (result.winner) {
    const winnerName = result.winner === "X" ? playerXName : playerOName;
    statusText = `Pemenang: ${winnerName} (${result.winner})`;
  } else if (result.isDraw) {
    statusText = "Permainan Seri";
  } else if (snapshot.activeBoard === null) {
    statusText = `Giliran: ${activePlayerName} (${snapshot.xIsNext ? "X" : "O"}) — bebas pilih papan`;
  } else {
    statusText = `Giliran: ${activePlayerName} (${snapshot.xIsNext ? "X" : "O"}) — wajib main di Papan ${snapshot.activeBoard + 1}`;
  }

  const moves = history.map((snap, move) => {
    let description = "Game Dimulai";
    if (move > 0 && snap.lastMove) {
      description = `#${move}: Papan ${snap.lastMove.board + 1}, Kotak ${snap.lastMove.cell + 1}`;
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
      {showModal && result.winner && (
        <WinModal
          winnerName={result.winner === "X" ? playerXName : playerOName}
          winnerSymbol={result.winner}
          onClose={restartGame}
        />
      )}

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
          <h1 className="game-title">ULTIMATE TIC TAC TOE</h1>
          <p className="game-subtitle">Menangkan Papan Besarnya!</p>
        </header>

        <main className="game-main">
          <div className="scoreboard">
            <div
              className={`score-card player-x-card ${!result.finished && snapshot.xIsNext && !isReadOnly ? "active" : ""} ${result.winner === "X" ? "winner-card" : ""}`}
            >
              <div className="player-avatar">X</div>
              <div className="player-details">
                <span className="player-label">Pemain X</span>
                <div className="player-name-row">
                  <input
                    className="player-name-input"
                    value={playerXName}
                    onChange={(e) => setPlayerXName(e.target.value)}
                    placeholder="Ketik nama di sini"
                    maxLength={12}
                  />
                  <span className="name-edit-icon" aria-hidden="true">✎</span>
                </div>
              </div>
            </div>

            <div className="vs-badge">
              <span className="vs-text">
                {result.winner ? "🎉" : result.isDraw ? "🤝" : "VS"}
              </span>
            </div>

            <div
              className={`score-card player-o-card ${!result.finished && !snapshot.xIsNext && !isReadOnly ? "active" : ""} ${result.winner === "O" ? "winner-card" : ""}`}
            >
              <div className="player-avatar">O</div>
              <div className="player-details">
                <span className="player-label">Pemain O</span>
                <div className="player-name-row">
                  <input
                    className="player-name-input"
                    value={playerOName}
                    onChange={(e) => setPlayerOName(e.target.value)}
                    placeholder="Ketik nama di sini"
                    maxLength={12}
                  />
                  <span className="name-edit-icon" aria-hidden="true">✎</span>
                </div>
              </div>
            </div>
          </div>

          <div className="game-layout">
            <div className="board-section">
              <div className="board-container">
                <div
                  className={`status-badge ${result.winner ? "status-winner" : result.isDraw ? "status-draw" : "status-normal"}`}
                >
                  {statusText}
                </div>

                <div className="meta-board">
                  {snapshot.boards.map((squares, boardIndex) => (
                    <MiniBoard
                      key={boardIndex}
                      squares={squares}
                      status={snapshot.boardWinners[boardIndex]}
                      isActive={
                        !isReadOnly &&
                        !result.finished &&
                        !snapshot.boardWinners[boardIndex] &&
                        (snapshot.activeBoard === null ||
                          snapshot.activeBoard === boardIndex)
                      }
                      isHighlighted={result.line.includes(boardIndex)}
                      onCellClick={(cellIndex) =>
                        handleCellClick(boardIndex, cellIndex)
                      }
                    />
                  ))}
                </div>
              </div>

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
                {result.finished && (
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