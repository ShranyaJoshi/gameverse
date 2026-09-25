import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { submitGameScore } from '../scoreService';

const ROWS = 6;
const COLS = 7;
const EMPTY = null;

export default function Connect4() {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'solo', 'lobby', 'multiplayer'
  const [board, setBoard] = useState(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY))
  );
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [score, setScore] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Multiplayer Room State
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [playerColor, setPlayerColor] = useState('Red'); // Host = Red, Guest = Yellow
  const channelRef = useRef(null);

  // Check 4-in-a-row in all directions
  const checkWinCondition = (grid) => {
    // 1. Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const disc = grid[r][c];
        if (disc && disc === grid[r][c + 1] && disc === grid[r][c + 2] && disc === grid[r][c + 3]) {
          return { winner: disc, cells: [[r, c], [r, c + 1], [r, c + 2], [r, c + 3]] };
        }
      }
    }
    // 2. Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r <= ROWS - 4; r++) {
        const disc = grid[r][c];
        if (disc && disc === grid[r + 1][c] && disc === grid[r + 2][c] && disc === grid[r + 3][c]) {
          return { winner: disc, cells: [[r, c], [r + 1, c], [r + 2, c], [r + 3, c]] };
        }
      }
    }
    // 3. Diagonal (down-right)
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const disc = grid[r][c];
        if (disc && disc === grid[r + 1][c + 1] && disc === grid[r + 2][c + 2] && disc === grid[r + 3][c + 3]) {
          return { winner: disc, cells: [[r, c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]] };
        }
      }
    }
    // 4. Diagonal (up-right)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const disc = grid[r][c];
        if (disc && disc === grid[r - 1][c + 1] && disc === grid[r - 2][c + 2] && disc === grid[r - 3][c + 3]) {
          return { winner: disc, cells: [[r, c], [r - 1, c + 1], [r - 2, c + 2], [r - 3, c + 3]] };
        }
      }
    }
    // 5. Draw
    if (grid.every((row) => row.every((cell) => cell !== EMPTY))) {
      return { winner: 'Draw', cells: [] };
    }
    return null;
  };

  const getOpenRow = (grid, col) => {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][col] === EMPTY) return r;
    }
    return -1;
  };

  const handleGameOver = async (gameWinner, myColor) => {
    if (gameWinner === myColor) {
      const newScore = score + 20;
      setScore(newScore);
      setStatusMessage('Submitting victory to Supabase...');
      const res = await submitGameScore('Connect4', newScore);
      if (res?.success) {
        setStatusMessage(`Victory! Score of ${newScore} saved to Leaderboard.`);
      }
    } else if (gameWinner === 'Draw') {
      setStatusMessage('Match ended in a Draw!');
    } else {
      setStatusMessage('Opponent won! Try again to earn points.');
    }
  };

  // Drop Disc Action
  const dropDisc = useCallback((col, color, isRemote = false, currentGrid = board) => {
    const row = getOpenRow(currentGrid, col);
    if (row === -1) return;

    const nextGrid = currentGrid.map((r) => [...r]);
    nextGrid[row][col] = color;
    setBoard(nextGrid);

    const result = checkWinCondition(nextGrid);
    if (result) {
      setWinner(result.winner);
      setWinningCells(result.cells);
      handleGameOver(result.winner, isRemote ? (color === 'Red' ? 'Yellow' : 'Red') : color);
    } else {
      setIsPlayerTurn((prev) => !prev);
    }
    return nextGrid;
  }, [board, score]);

  // Bot Logic for Solo Mode
  const executeBotTurn = useCallback((currentGrid) => {
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getOpenRow(currentGrid, c) !== -1) validCols.push(c);
    }
    if (validCols.length === 0) return;

    // Check if Bot can win
    for (let c of validCols) {
      const row = getOpenRow(currentGrid, c);
      const test = currentGrid.map((r) => [...r]);
      test[row][c] = 'Yellow';
      if (checkWinCondition(test)?.winner === 'Yellow') {
        dropDisc(c, 'Yellow', false, currentGrid);
        return;
      }
    }
    // Block Player
    for (let c of validCols) {
      const row = getOpenRow(currentGrid, c);
      const test = currentGrid.map((r) => [...r]);
      test[row][c] = 'Red';
      if (checkWinCondition(test)?.winner === 'Red') {
        dropDisc(c, 'Yellow', false, currentGrid);
        return;
      }
    }
    // Center preference
    if (validCols.includes(3)) {
      dropDisc(3, 'Yellow', false, currentGrid);
      return;
    }
    const rand = validCols[Math.floor(Math.random() * validCols.length)];
    dropDisc(rand, 'Yellow', false, currentGrid);
  }, [dropDisc]);

  const handleColumnClick = (col) => {
    if (!isPlayerTurn || winner) return;

    const nextGrid = dropDisc(col, playerColor, false, board);

    if (gameMode === 'multiplayer' && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'c4_move',
        payload: { col, color: playerColor },
      });
    }

    if (gameMode === 'solo' && nextGrid && !checkWinCondition(nextGrid)) {
      setTimeout(() => executeBotTurn(nextGrid), 450);
    }
  };

  // Multiplayer Setup
  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomId(code);
    setPlayerColor('Red');
    setIsPlayerTurn(true);
    initRoom(code, 'Red');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    const code = inputRoomId.trim().toUpperCase();
    setRoomId(code);
    setPlayerColor('Yellow');
    setIsPlayerTurn(false);
    initRoom(code, 'Yellow');
  };

  const initRoom = (code, myColor) => {
    resetBoard();
    const channel = supabase.channel(`c4_room_${code}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'c4_move' }, ({ payload }) => {
        if (payload.color !== myColor) {
          dropDisc(payload.col, payload.color, true);
        }
      })
      .on('broadcast', { event: 'c4_restart' }, () => {
        resetBoard();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setGameMode('multiplayer');
        }
      });

    channelRef.current = channel;
  };

  const resetBoard = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY)));
    setWinner(null);
    setWinningCells([]);
    setStatusMessage('');
    setIsPlayerTurn(playerColor === 'Red');
  };

  const broadcastRestart = () => {
    resetBoard();
    if (gameMode === 'multiplayer' && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'c4_restart',
        payload: {},
      });
    }
  };

  const exitToMenu = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setGameMode('menu');
    resetBoard();
    setScore(0);
  };

  return (
    <div
      style={{
        backgroundColor: '#fdfbf7',
        minHeight: 'calc(100vh - 80px)',
        padding: '30px 16px',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '28px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#f87171',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          VERTICAL STRATEGY
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
          Connect 4
        </h1>

        {/* --- SCREEN 1: MENU --- */}
        {gameMode === 'menu' && (
          <div style={{ padding: '20px 0' }}>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
              Drop discs against the computer or challenge a friend in 2-player room code mode!
            </p>
            <button
              onClick={() => {
                setPlayerColor('Red');
                setIsPlayerTurn(true);
                resetBoard();
                setGameMode('solo');
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9999px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              🤖 Play Solo (vs Bot)
            </button>
            <button
              onClick={() => setGameMode('lobby')}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9999px',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              👥 2-Player Room Code Mode
            </button>
          </div>
        )}

        {/* --- SCREEN 2: MULTIPLAYER LOBBY --- */}
        {gameMode === 'lobby' && (
          <div style={{ padding: '16px 0' }}>
            <h3 style={{ margin: '0 0 14px 0', color: '#1f2937' }}>Multiplayer Lobby</h3>
            <button
              onClick={handleCreateRoom}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9999px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: '700',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '14px',
              }}
            >
              Create Room (You: Red)
            </button>
            <div style={{ margin: '12px 0', color: '#9ca3af', fontWeight: '600', fontSize: '12px' }}>
              — OR ENTER CODE —
            </div>
            <form onSubmit={handleJoinRoom} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                maxLength={4}
                placeholder="4-LETTER CODE"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '9999px',
                  border: '1px solid #d1d5db',
                  textAlign: 'center',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Join (You: Yellow)
              </button>
            </form>
            <button
              onClick={exitToMenu}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer' }}
            >
              ← Back to Mode Select
            </button>
          </div>
        )}

        {/* --- SCREEN 3: ACTIVE GAME --- */}
        {(gameMode === 'solo' || gameMode === 'multiplayer') && (
          <>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '14px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>
                {winner
                  ? winner === 'Draw'
                    ? 'Game is a Draw!'
                    : winner === playerColor
                    ? '🎉 You Won!'
                    : 'Opponent Won!'
                  : isPlayerTurn
                  ? `Your Turn (${playerColor})`
                  : gameMode === 'solo'
                  ? 'Bot Thinking (Yellow)...'
                  : 'Opponent Turn...'}
              </span>
              {gameMode === 'multiplayer' ? (
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>
                  CODE: {roomId}
                </span>
              ) : (
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                  Points: {score}
                </span>
              )}
            </div>

            {/* Connect 4 Grid */}
            <div
              style={{
                display: 'inline-grid',
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gap: '8px',
                backgroundColor: '#2563eb',
                padding: '14px',
                borderRadius: '18px',
                boxShadow: '0 8px 16px rgba(37, 99, 235, 0.2)',
              }}
            >
              {Array.from({ length: COLS }).map((_, c) => (
                <div
                  key={c}
                  onClick={() => handleColumnClick(c)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: isPlayerTurn && !winner ? 'pointer' : 'default',
                  }}
                >
                  {Array.from({ length: ROWS }).map((_, r) => {
                    const cell = board[r][c];
                    const isWin = winningCells.some(([wr, wc]) => wr === r && wc === c);
                    let bg = '#ffffff';
                    if (cell === 'Red') bg = '#ef4444';
                    if (cell === 'Yellow') bg = '#facc15';

                    return (
                      <div
                        key={`${r}-${c}`}
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          backgroundColor: bg,
                          border: isWin ? '3px solid #10b981' : '2px solid rgba(0,0,0,0.06)',
                          boxSizing: 'border-box',
                          transition: 'background-color 0.15s ease',
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {statusMessage && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '8px 12px',
                  backgroundColor: '#ecfdf5',
                  borderRadius: '10px',
                  color: '#065f46',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {statusMessage}
              </div>
            )}

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={broadcastRestart}
                style={{
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {winner ? 'Play Again' : 'Reset Grid'}
              </button>
              <button
                onClick={exitToMenu}
                style={{
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  fontWeight: '700',
                  fontSize: '13px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Exit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}