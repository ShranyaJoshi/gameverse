import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { submitGameScore } from '../scoreService';

const GRID_SIZE = 20;
const TILE_SIZE = 20;

export default function Snake() {
  const canvasRef = useRef(null);

  const [gameMode, setGameMode] = useState('menu'); // 'menu', 'solo', 'lobby', 'multiplayer'
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Multiplayer Room State
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [playerRole, setPlayerRole] = useState('p1'); // p1 = Green, p2 = Purple
  const channelRef = useRef(null);

  // References to keep game loop synchronized without stale closures
  const localSnakeRef = useRef([{ x: 5, y: 10 }]);
  const localDirRef = useRef({ x: 1, y: 0 });
  const opponentSnakeRef = useRef([{ x: 14, y: 10 }]);
  const foodRef = useRef({ x: 10, y: 10 });
  const isGameOverRef = useRef(false);
  isGameOverRef.current = isGameOver;

  const handleGameOverSequence = async (finalScore, isVictory = false) => {
    setIsGameOver(true);
    if (isVictory) {
      setStatusMessage('Victory! Opponent crashed. Saving score...');
      const res = await submitGameScore('Snake', finalScore > 0 ? finalScore : 50);
      if (res?.success) setStatusMessage('Victory recorded on Leaderboard!');
    } else {
      setStatusMessage('Game Over! Saving score to Leaderboard...');
      if (finalScore > 0) {
        const res = await submitGameScore('Snake', finalScore);
        if (res?.success) setStatusMessage(`Final Score of ${finalScore} saved!`);
      }
    }
  };

  const spawnFood = () => {
    foodRef.current = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  };

  // Start Solo Game
  const startSolo = () => {
    localSnakeRef.current = [{ x: 10, y: 10 }];
    localDirRef.current = { x: 1, y: 0 };
    spawnFood();
    setScore(0);
    setIsGameOver(false);
    setStatusMessage('');
    setPlayerRole('solo');
    setGameMode('solo');
  };

  // Multiplayer Handlers
  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomId(code);
    setPlayerRole('p1');
    initRoom(code, 'p1');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    const code = inputRoomId.trim().toUpperCase();
    setRoomId(code);
    setPlayerRole('p2');
    initRoom(code, 'p2');
  };

  const initRoom = (code, myRole) => {
    localSnakeRef.current = myRole === 'p1' ? [{ x: 4, y: 10 }] : [{ x: 15, y: 10 }];
    localDirRef.current = myRole === 'p1' ? { x: 1, y: 0 } : { x: -1, y: 0 };
    opponentSnakeRef.current = myRole === 'p1' ? [{ x: 15, y: 10 }] : [{ x: 4, y: 10 }];
    spawnFood();
    setScore(0);
    setOpponentScore(0);
    setIsGameOver(false);
    setStatusMessage('');

    const channel = supabase.channel(`snake_room_${code}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'snake_state' }, ({ payload }) => {
        if (payload.role !== myRole) {
          opponentSnakeRef.current = payload.snake;
          setOpponentScore(payload.score);
        }
      })
      .on('broadcast', { event: 'snake_crashed' }, ({ payload }) => {
        if (payload.role !== myRole) {
          handleGameOverSequence(score, true);
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setGameMode('multiplayer');
        }
      });

    channelRef.current = channel;
  };

  // Game Loop
  useEffect(() => {
    if (gameMode !== 'solo' && gameMode !== 'multiplayer') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleKeyDown = (e) => {
      const cur = localDirRef.current;
      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && cur.y === 0) localDirRef.current = { x: 0, y: -1 };
      if ((e.code === 'ArrowDown' || e.code === 'KeyS') && cur.y === 0) localDirRef.current = { x: 0, y: 1 };
      if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && cur.x === 0) localDirRef.current = { x: -1, y: 0 };
      if ((e.code === 'ArrowRight' || e.code === 'KeyD') && cur.x === 0) localDirRef.current = { x: 1, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);

    const interval = setInterval(() => {
      if (isGameOverRef.current) return;

      const head = {
        x: localSnakeRef.current[0].x + localDirRef.current.x,
        y: localSnakeRef.current[0].y + localDirRef.current.y,
      };

      // Border collision check
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        if (gameMode === 'multiplayer' && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'snake_crashed',
            payload: { role: playerRole },
          });
        }
        handleGameOverSequence(score, false);
        return;
      }

      // Self-collision check
      for (let segment of localSnakeRef.current) {
        if (head.x === segment.x && head.y === segment.y) {
          if (gameMode === 'multiplayer' && channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'snake_crashed',
              payload: { role: playerRole },
            });
          }
          handleGameOverSequence(score, false);
          return;
        }
      }

      const newSnake = [head, ...localSnakeRef.current];

      // Food check
      if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
        setScore((s) => s + 10);
        spawnFood();
      } else {
        newSnake.pop();
      }

      localSnakeRef.current = newSnake;

      // Broadcast coordinates to room
      if (gameMode === 'multiplayer' && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'snake_state',
          payload: { role: playerRole, snake: newSnake, score },
        });
      }

      // Render Screen
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, GRID_SIZE * TILE_SIZE, GRID_SIZE * TILE_SIZE);

      // Render Food
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(
        foodRef.current.x * TILE_SIZE + TILE_SIZE / 2,
        foodRef.current.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2.3,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Render Local Snake
      ctx.fillStyle = playerRole === 'p2' ? '#a855f7' : '#22c55e';
      localSnakeRef.current.forEach((seg) => {
        ctx.fillRect(seg.x * TILE_SIZE + 1, seg.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      });

      // Render Opponent Snake (in multiplayer)
      if (gameMode === 'multiplayer') {
        ctx.fillStyle = playerRole === 'p2' ? '#22c55e' : '#a855f7';
        opponentSnakeRef.current.forEach((seg) => {
          ctx.fillRect(seg.x * TILE_SIZE + 1, seg.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
        });
      }
    }, 130);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameMode, playerRole, score]);

  const exitToMenu = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setGameMode('menu');
    setIsGameOver(false);
    setStatusMessage('');
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
          RETRO ARCADE
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
          Snake
        </h1>

        {/* --- SCREEN 1: MENU --- */}
        {gameMode === 'menu' && (
          <div style={{ padding: '20px 0' }}>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
              Practice classic Snake solo or race against a friend on the same arena grid!
            </p>
            <button
              onClick={startSolo}
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
              🍎 Play Solo Classic
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
              👥 2-Player Head-to-Head Duel
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
              Create Room (You: Green Snake)
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
                Join (You: Purple)
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
                marginBottom: '14px',
                padding: '10px 16px',
                backgroundColor: '#f3f4f6',
                borderRadius: '14px',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: '700', color: playerRole === 'p2' ? '#a855f7' : '#10b981' }}>
                Your Score: {score}
              </span>
              {gameMode === 'multiplayer' ? (
                <>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#3b82f6' }}>
                    ROOM: {roomId}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: playerRole === 'p2' ? '#10b981' : '#a855f7' }}>
                    Opponent: {opponentScore}
                  </span>
                </>
              ) : (
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  Use WASD or Arrows
                </span>
              )}
            </div>

            <div style={{ borderRadius: '14px', overflow: 'hidden', display: 'inline-block', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}>
              <canvas ref={canvasRef} width={GRID_SIZE * TILE_SIZE} height={GRID_SIZE * TILE_SIZE} style={{ display: 'block' }} />
            </div>

            {statusMessage && (
              <div
                style={{
                  marginTop: '14px',
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

            <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {isGameOver && gameMode === 'solo' && (
                <button
                  onClick={startSolo}
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
                  Play Again
                </button>
              )}
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