import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { submitGameScore } from '../scoreService';

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export default function TicTacToe() {
  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'solo', 'lobby', 'multiplayer'
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null); // 'X', 'O', or 'Draw'
  const [winningLine, setWinningLine] = useState([]);
  const [score, setScore] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  // Multiplayer Room State
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [playerSymbol, setPlayerSymbol] = useState('X'); // Host = X, Guest = O
  const channelRef = useRef(null);

  // Check board state for win or draw
  const checkWinner = (squares) => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: combo };
      }
    }
    if (squares.every((sq) => sq !== null)) {
      return { winner: 'Draw', line: [] };
    }
    return null;
  };

  // Score submission
  const handleGameEnd = async (gameWinner, currentSymbol) => {
    if (gameWinner === currentSymbol) {
      const newScore = score + 10;
      setScore(newScore);
      setStatusMessage('Victory! Saving score to Supabase...');
      const res = await submitGameScore('TicTacToe', newScore);
      if (res?.success) {
        setStatusMessage(`Victory! Score of ${newScore} saved to Leaderboard.`);
      }
    } else if (gameWinner === 'Draw') {
      setStatusMessage('Match ended in a Draw!');
    } else {
      setStatusMessage('Opponent won! Try again to earn points.');
    }
  };

  // Bot logic that directly evaluates a passed board snapshot
  const computeBotMove = (currentBoard) => {
    const emptyIndices = currentBoard
      .map((val, idx) => (val === null ? idx : null))
      .filter((val) => val !== null);

    if (emptyIndices.length === 0) return null;

    // 1. Can bot win?
    for (let idx of emptyIndices) {
      const copy = [...currentBoard];
      copy[idx] = 'O';
      if (checkWinner(copy)?.winner === 'O') return idx;
    }

    // 2. Must bot block player?
    for (let idx of emptyIndices) {
      const copy = [...currentBoard];
      copy[idx] = 'X';
      if (checkWinner(copy)?.winner === 'X') return idx;
    }

    // 3. Take center if available
    if (emptyIndices.includes(4)) return 4;

    // 4. Random available tile
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  };

  // Execute a move on the board
  const applyMove = (index, symbol) => {
    if (board[index] || winner) return;

    const nextBoard = [...board];
    nextBoard[index] = symbol;
    setBoard(nextBoard);

    const result = checkWinner(nextBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      handleGameEnd(result.winner, playerSymbol);
      return;
    }

    // Next turn
    const nextIsPlayerTurn = symbol !== playerSymbol;
    setIsPlayerTurn(nextIsPlayerTurn);

    // If in Solo Mode and it is now the Bot's turn, trigger the bot move
    if (gameMode === 'solo' && symbol === playerSymbol) {
      setTimeout(() => {
        const botIndex = computeBotMove(nextBoard);
        if (botIndex !== null) {
          const afterBotBoard = [...nextBoard];
          afterBotBoard[botIndex] = 'O';
          setBoard(afterBotBoard);

          const botResult = checkWinner(afterBotBoard);
          if (botResult) {
            setWinner(botResult.winner);
            setWinningLine(botResult.line);
            handleGameEnd(botResult.winner, playerSymbol);
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 400);
    }
  };

  const handleSquareClick = (index) => {
    if (board[index] || winner || !isPlayerTurn) return;

    // In multiplayer, send move over broadcast channel
    if (gameMode === 'multiplayer' && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'tictactoe_move',
        payload: { index, symbol: playerSymbol },
      });
    }

    applyMove(index, playerSymbol);
  };

  // --- MULTIPLAYER ROOM SETUP ---
  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomId(code);
    setPlayerSymbol('X');
    setIsPlayerTurn(true);
    initRoom(code, 'X');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    const code = inputRoomId.trim().toUpperCase();
    setRoomId(code);
    setPlayerSymbol('O');
    setIsPlayerTurn(false); // X goes first
    initRoom(code, 'O');
  };

  const initRoom = (code, mySymbol) => {
    resetBoard();
    const channel = supabase.channel(`ttt_room_${code}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'tictactoe_move' }, ({ payload }) => {
        if (payload.symbol !== mySymbol) {
          setBoard((prev) => {
            const next = [...prev];
            next[payload.index] = payload.symbol;
            const res = checkWinner(next);
            if (res) {
              setWinner(res.winner);
              setWinningLine(res.line);
              handleGameEnd(res.winner, mySymbol);
            } else {
              setIsPlayerTurn(true);
            }
            return next;
          });
        }
      })
      .on('broadcast', { event: 'tictactoe_restart' }, () => {
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
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine([]);
    setStatusMessage('');
    setIsPlayerTurn(playerSymbol === 'X');
  };

  const broadcastRestart = () => {
    resetBoard();
    if (gameMode === 'multiplayer' && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'tictactoe_restart',
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
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
          textAlign: 'center',
          boxSizing: 'border-box',
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
          CLASSIC STRATEGY
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
          Tic Tac Toe
        </h1>

        {/* --- SCREEN 1: MENU --- */}
        {gameMode === 'menu' && (
          <div style={{ padding: '20px 0' }}>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
              Play solo against the AI or challenge a friend in real time using a room code!
            </p>
            <button
              onClick={() => {
                setPlayerSymbol('X');
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
              Create Room (You: X)
            </button>
            <div style={{ margin: '12px 0', color: '#9ca3af', fontWeight: '600', fontSize: '12px' }}>
              — OR JOIN WITH CODE —
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
                Join (You: O)
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
                marginBottom: '20px',
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '14px',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563' }}>
                {winner
                  ? winner === 'Draw'
                    ? 'Game is a Draw!'
                    : winner === playerSymbol
                    ? '🎉 You Won!'
                    : 'Opponent Won!'
                  : isPlayerTurn
                  ? `Your Turn (${playerSymbol})`
                  : gameMode === 'solo'
                  ? 'Bot Thinking (O)...'
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

            {/* 3x3 Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                maxWidth: '300px',
                margin: '0 auto',
              }}
            >
              {board.map((cell, index) => {
                const isWinningSquare = winningLine.includes(index);
                return (
                  <button
                    key={index}
                    onClick={() => handleSquareClick(index)}
                    disabled={cell !== null || winner !== null || !isPlayerTurn}
                    style={{
                      width: '90px',
                      height: '90px',
                      borderRadius: '16px',
                      backgroundColor: isWinningSquare ? '#c6dfcb' : cell ? '#f9fafb' : '#ffffff',
                      border: isWinningSquare ? '2px solid #10b981' : '2px solid #e5e7eb',
                      fontSize: '34px',
                      fontWeight: '800',
                      color: cell === 'X' ? '#3b82f6' : '#ef4444',
                      cursor: cell === null && !winner && isPlayerTurn ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {cell}
                  </button>
                );
              })}
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
                {winner ? 'Play Again' : 'Reset Board'}
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