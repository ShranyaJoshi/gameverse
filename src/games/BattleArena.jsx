import { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabaseClient';
import { submitGameScore } from '../scoreService';
import harryImgSrc from '../assets/harry.png';
import voldemortImgSrc from '../assets/voldemort.png';

export default function BattleArena() {
  const canvasRef = useRef(null);

  // Mode Selection: 'menu', 'singleplayer', 'multiplayer_lobby', 'multiplayer_active'
  const [gameMode, setGameMode] = useState('menu');

  // Multiplayer Room State
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [role, setRole] = useState('harry'); // 'harry' (host) or 'voldemort' (guest)

  // HUD & Game State
  const [playerHp, setPlayerHp] = useState(100);
  const [enemyHp, setEnemyHp] = useState(100);
  const [score, setScore] = useState(0);
  const [stage, setStage] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Refs for animation loop & networking
  const channelRef = useRef(null);
  const scoreRef = useRef(0);
  scoreRef.current = score;
  const gameModeRef = useRef('menu');
  gameModeRef.current = gameMode;
  const roleRef = useRef('harry');
  roleRef.current = role;

  const localPlayerRef = useRef({
    x: 100,
    y: 280,
    w: 64,
    h: 80,
    vx: 0,
    vy: 0,
    speed: 5,
    isGrounded: true,
    facing: 'right',
    hp: 100,
    isShielding: false,
    squash: 1,
    castCooldown: 0,
    hurtTimer: 0,
  });

  const opponentRef = useRef({
    x: 620,
    y: 276,
    w: 64,
    h: 84,
    vx: 0,
    vy: 0,
    speed: 2.2,
    isGrounded: true,
    facing: 'left',
    hp: 100,
    maxHp: 100,
    isShielding: false,
    squash: 1,
    hurtTimer: 0,
    // AI Bot specific timers
    teleportTimer: 180,
    castCooldown: 60,
    jitterHopTimer: 0,
  });

  const spellsRef = useRef([]);
  const particlesRef = useRef([]);
  const damagePopupsRef = useRef([]);

  // Reset / Return to Mode Select
  const backToMenu = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setGameMode('menu');
    setIsGameOver(false);
    setStatusMessage('');
    setScore(0);
    setStage(1);
  };

  // Start Single Player against Bot
  const startSinglePlayer = () => {
    localPlayerRef.current.x = 100;
    localPlayerRef.current.y = 280;
    localPlayerRef.current.facing = 'right';
    localPlayerRef.current.hp = 100;
    localPlayerRef.current.isShielding = false;

    opponentRef.current.x = 620;
    opponentRef.current.y = 276;
    opponentRef.current.facing = 'left';
    opponentRef.current.hp = 100;
    opponentRef.current.maxHp = 100;

    setPlayerHp(100);
    setEnemyHp(100);
    setScore(0);
    setStage(1);
    setRole('harry');
    setIsGameOver(false);
    setStatusMessage('');
    setGameMode('singleplayer');
  };

  // --- MULTIPLAYER ROOM CREATION & JOINING ---
  const handleCreateRoom = () => {
    const code = Math.random().toString(36).substring(2, 6).toUpperCase();
    setRoomId(code);
    setRole('harry');
    initMultiplayer(code, 'harry');
  };

  const handleJoinRoom = (e) => {
    e.preventDefault();
    if (!inputRoomId.trim()) return;
    const code = inputRoomId.trim().toUpperCase();
    setRoomId(code);
    setRole('voldemort');
    initMultiplayer(code, 'voldemort');
  };

  const initMultiplayer = (code, assignedRole) => {
    if (assignedRole === 'voldemort') {
      localPlayerRef.current.x = 620;
      localPlayerRef.current.y = 276;
      localPlayerRef.current.facing = 'left';
      localPlayerRef.current.hp = 100;

      opponentRef.current.x = 100;
      opponentRef.current.y = 280;
      opponentRef.current.facing = 'right';
      opponentRef.current.hp = 100;
    } else {
      localPlayerRef.current.x = 100;
      localPlayerRef.current.y = 280;
      localPlayerRef.current.facing = 'right';
      localPlayerRef.current.hp = 100;

      opponentRef.current.x = 620;
      opponentRef.current.y = 276;
      opponentRef.current.facing = 'left';
      opponentRef.current.hp = 100;
    }

    setPlayerHp(100);
    setEnemyHp(100);
    setIsGameOver(false);
    setStatusMessage('');

    const channel = supabase.channel(`arena_duel_${code}`, {
      config: { broadcast: { ack: false } },
    });

    channel
      .on('broadcast', { event: 'player_move' }, ({ payload }) => {
        if (payload.role !== assignedRole) {
          opponentRef.current.x = payload.x;
          opponentRef.current.y = payload.y;
          opponentRef.current.facing = payload.facing;
          opponentRef.current.isShielding = payload.isShielding;
          opponentRef.current.squash = payload.squash;
        }
      })
      .on('broadcast', { event: 'cast_spell' }, ({ payload }) => {
        if (payload.role !== assignedRole) {
          spellsRef.current.push({
            x: payload.x,
            y: payload.y,
            vx: payload.vx,
            caster: payload.role,
            color: payload.color,
            trailColor: payload.trailColor,
            radius: payload.radius,
          });
        }
      })
      .on('broadcast', { event: 'health_sync' }, ({ payload }) => {
        if (payload.role !== assignedRole) {
          opponentRef.current.hp = payload.hp;
          setEnemyHp(payload.hp);
          if (payload.hp <= 0) {
            handleCombatVictory(100);
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setGameMode('multiplayer_active');
        }
      });

    channelRef.current = channel;
  };

  const handleCombatVictory = async (pts) => {
    setIsGameOver(true);
    setStatusMessage('Victory! Opponent defeated. Saving score to Supabase...');
    const result = await submitGameScore('BattleArena', pts);
    if (result?.success) {
      setStatusMessage(`Victory! Score of ${pts} saved to Leaderboard.`);
    }
  };

  const handleCombatDefeat = async (finalScore) => {
    setIsGameOver(true);
    setStatusMessage('You fell in battle!');
    if (finalScore > 0) {
      await submitGameScore('BattleArena', finalScore);
    }
  };

  // --- MAIN CANVAS LOOP ---
  useEffect(() => {
    if (gameMode !== 'singleplayer' && gameMode !== 'multiplayer_active') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 440;
    const GROUND_Y = 360;
    const GRAVITY = 0.75;

    let animationFrameId;

    const harrySprite = new Image();
    harrySprite.src = harryImgSrc;

    const voldemortSprite = new Image();
    voldemortSprite.src = voldemortImgSrc;

    const keys = { left: false, right: false, shield: false };

    const onKeyDown = (e) => {
      if (isGameOver) return;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;

      // Mario Jitter Leap
      if ((e.code === 'KeyW' || e.code === 'ArrowUp') && localPlayerRef.current.isGrounded) {
        localPlayerRef.current.vy = -14;
        localPlayerRef.current.isGrounded = false;
        localPlayerRef.current.squash = 1.35;
      }

      // Cast Spell
      if (e.code === 'Space' || e.code === 'KeyJ') {
        const p = localPlayerRef.current;
        if (p.castCooldown <= 0 && !p.isShielding) {
          p.castCooldown = 22;

          const isHarry = roleRef.current === 'harry';
          const spellData = {
            x: p.facing === 'right' ? p.x + p.w : p.x - 10,
            y: p.y + 36,
            vx: p.facing === 'right' ? 9 : -9,
            caster: roleRef.current,
            color: isHarry ? '#f59e0b' : '#22c55e',
            trailColor: isHarry ? '#ef4444' : '#15803d',
            radius: 8,
          };

          spellsRef.current.push(spellData);

          // Broadcast in multiplayer
          if (gameModeRef.current === 'multiplayer_active' && channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'cast_spell',
              payload: spellData,
            });
          }
        }
      }

      if (e.code === 'KeyK' || e.code === 'ShiftLeft') {
        keys.shield = true;
      }
    };

    const onKeyUp = (e) => {
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keys.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
      if (e.code === 'KeyK' || e.code === 'ShiftLeft') keys.shield = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const createSparks = (x, y, color = '#facc15', count = 10) => {
      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          alpha: 1,
          size: Math.random() * 3 + 2,
          color,
        });
      }
    };

    const addDamagePopup = (x, y, text, color = '#ffffff') => {
      damagePopupsRef.current.push({
        x,
        y: y - 10,
        text,
        color,
        vy: -1.4,
        alpha: 1,
      });
    };

    const loop = () => {
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Arena backdrop pillars
      ctx.fillStyle = '#1e2640';
      ctx.fillRect(40, 60, 50, 300);
      ctx.fillRect(710, 60, 50, 300);
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
      ctx.stroke();

      const p = localPlayerRef.current;
      const bot = opponentRef.current;

      if (!isGameOver) {
        // --- 1. LOCAL HERO CONTROLS & PHYSICS ---
        p.isShielding = keys.shield;

        if (keys.left && !p.isShielding) {
          p.vx = -p.speed;
          p.facing = 'left';
        } else if (keys.right && !p.isShielding) {
          p.vx = p.speed;
          p.facing = 'right';
        } else {
          p.vx *= 0.7;
        }

        p.vy += GRAVITY;
        p.x += p.vx;
        p.y += p.vy;

        if (p.y + p.h >= GROUND_Y) {
          if (!p.isGrounded) p.squash = 0.8;
          p.y = GROUND_Y - p.h;
          p.vy = 0;
          p.isGrounded = true;
        }
        p.squash += (1 - p.squash) * 0.15;

        if (p.x < 15) p.x = 15;
        if (p.x + p.w > CANVAS_WIDTH - 15) p.x = CANVAS_WIDTH - 15 - p.w;

        if (p.castCooldown > 0) p.castCooldown--;
        if (p.hurtTimer > 0) p.hurtTimer--;

        // Broadcast move if in multiplayer
        if (gameModeRef.current === 'multiplayer_active' && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'player_move',
            payload: {
              role: roleRef.current,
              x: p.x,
              y: p.y,
              facing: p.facing,
              isShielding: p.isShielding,
              squash: p.squash,
            },
          });
        }

        // --- 2. SINGLE PLAYER BOT AI (Voldemort) ---
        if (gameModeRef.current === 'singleplayer') {
          if (bot.hurtTimer > 0) bot.hurtTimer--;
          bot.castCooldown--;
          bot.teleportTimer--;

          // Bot Mario Jitter Hop
          bot.jitterHopTimer++;
          if (bot.jitterHopTimer > 50 && bot.isGrounded) {
            bot.vy = -10 - Math.random() * 3;
            bot.isGrounded = false;
            bot.jitterHopTimer = 0;
          }

          bot.vy += GRAVITY;
          bot.y += bot.vy;

          if (bot.y + bot.h >= GROUND_Y) {
            bot.y = GROUND_Y - bot.h;
            bot.vy = 0;
            bot.isGrounded = true;
          }

          bot.facing = bot.x > p.x ? 'left' : 'right';

          // Tactical spacing with jitter
          const dist = Math.abs(bot.x - p.x);
          if (dist > 280) {
            bot.vx = bot.facing === 'left' ? -bot.speed : bot.speed;
          } else if (dist < 130) {
            bot.vx = bot.facing === 'left' ? bot.speed : -bot.speed;
          } else {
            bot.vx = Math.sin(Date.now() / 130) * 2;
          }
          bot.x += bot.vx;

          // Smoke Shift Teleport
          if (bot.teleportTimer <= 0) {
            createSparks(bot.x + bot.w / 2, bot.y + bot.h / 2, '#15803d', 18);
            bot.x = p.x > CANVAS_WIDTH / 2 ? 100 + Math.random() * 150 : 550 + Math.random() * 150;
            bot.teleportTimer = 220 + Math.random() * 80;
            createSparks(bot.x + bot.w / 2, bot.y + bot.h / 2, '#22c55e', 18);
          }

          // Bot casts Avada Kedavra
          if (bot.castCooldown <= 0) {
            bot.castCooldown = 75 + Math.random() * 30;
            spellsRef.current.push({
              x: bot.facing === 'left' ? bot.x - 20 : bot.x + bot.w + 5,
              y: bot.y + 36,
              vx: bot.facing === 'left' ? -7.5 : 7.5,
              caster: 'voldemort',
              color: '#22c55e',
              trailColor: '#15803d',
              radius: 9,
            });
          }
        }

        // --- 3. SPELL COLLISIONS ---
        spellsRef.current = spellsRef.current.filter((spell) => {
          spell.x += spell.vx;

          particlesRef.current.push({
            x: spell.x,
            y: spell.y,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            alpha: 0.6,
            size: 3,
            color: spell.trailColor,
          });

          // Singleplayer hit detection on Bot
          if (gameModeRef.current === 'singleplayer' && spell.caster === 'harry') {
            if (
              spell.x > bot.x &&
              spell.x < bot.x + bot.w &&
              spell.y > bot.y &&
              spell.y < bot.y + bot.h
            ) {
              const dmg = 25;
              bot.hp = Math.max(0, bot.hp - dmg);
              setEnemyHp(bot.hp);
              bot.hurtTimer = 12;
              bot.vx = spell.vx > 0 ? 5 : -5;
              createSparks(spell.x, spell.y, '#f59e0b', 16);
              addDamagePopup(bot.x + 20, bot.y, `-${dmg}`, '#f59e0b');

              if (bot.hp <= 0) {
                // Next wave progression in Single Player
                createSparks(bot.x + bot.w / 2, bot.y + bot.h / 2, '#22c55e', 30);
                const earned = 50 * stage;
                setScore((s) => s + earned);
                setStage((stg) => {
                  const nxt = stg + 1;
                  bot.hp = 100 + nxt * 25;
                  bot.maxHp = bot.hp;
                  setEnemyHp(bot.hp);
                  return nxt;
                });
                setStatusMessage(`Stage Cleared! +${earned} points.`);
              }
              return false;
            }
          }

          // Spell hits Local Player (in Single Player or Multiplayer)
          if (spell.caster !== roleRef.current) {
            if (
              spell.x > p.x &&
              spell.x < p.x + p.w &&
              spell.y > p.y &&
              spell.y < p.y + p.h
            ) {
              let dmg = 20;
              if (
                p.isShielding &&
                ((spell.vx > 0 && p.facing === 'left') || (spell.vx < 0 && p.facing === 'right'))
              ) {
                dmg = 3; // Protego Block
                createSparks(spell.x, spell.y, '#38bdf8', 14);
                addDamagePopup(p.x + 15, p.y, 'Protego!', '#38bdf8');
              } else {
                p.hurtTimer = 12;
                p.vx = spell.vx > 0 ? 4 : -4;
                createSparks(spell.x, spell.y, '#ef4444', 16);
                addDamagePopup(p.x + 15, p.y, `-${dmg}`, '#ef4444');
              }

              p.hp = Math.max(0, p.hp - dmg);
              setPlayerHp(p.hp);

              // Sync health to peer if in multiplayer
              if (gameModeRef.current === 'multiplayer_active' && channelRef.current) {
                channelRef.current.send({
                  type: 'broadcast',
                  event: 'health_sync',
                  payload: { role: roleRef.current, hp: p.hp },
                });
              }

              if (p.hp <= 0) {
                handleCombatDefeat(scoreRef.current);
              }
              return false;
            }
          }

          return spell.x > 0 && spell.x < CANVAS_WIDTH;
        });
      }

      // --- 4. DRAW CHARACTERS ---
      const drawCharacter = (character, sprite, isLocal) => {
        ctx.save();
        const drawY = character.y + character.h * (1 - character.squash);
        const drawH = character.h * character.squash;

        if (character.hurtTimer > 0 && Math.floor(character.hurtTimer / 2) % 2 === 0) {
          ctx.globalAlpha = 0.4;
        }

        const naturallyFacesRight =
          (isLocal && roleRef.current === 'harry') || (!isLocal && roleRef.current === 'voldemort');

        if (
          (naturallyFacesRight && character.facing === 'left') ||
          (!naturallyFacesRight && character.facing === 'right')
        ) {
          ctx.translate(character.x + character.w, drawY);
          ctx.scale(-1, 1);
          ctx.drawImage(sprite, 0, 0, character.w, drawH);
        } else {
          ctx.drawImage(sprite, character.x, drawY, character.w, drawH);
        }

        if (character.isShielding) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(character.x + character.w / 2, character.y + character.h / 2, 42, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.restore();
      };

      if (roleRef.current === 'harry') {
        drawCharacter(p, harrySprite, true);
        drawCharacter(bot, voldemortSprite, false);
      } else {
        drawCharacter(p, voldemortSprite, true);
        drawCharacter(bot, harrySprite, false);
      }

      // Draw Spells
      spellsRef.current.forEach((s) => {
        ctx.save();
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 12;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Draw Particles
      particlesRef.current = particlesRef.current.filter((pt) => {
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= 0.035;
        if (pt.alpha <= 0) return false;
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
        ctx.restore();
        return true;
      });

      // Draw Damage Numbers
      damagePopupsRef.current = damagePopupsRef.current.filter((d) => {
        d.y += d.vy;
        d.alpha -= 0.025;
        if (d.alpha <= 0) return false;
        ctx.save();
        ctx.globalAlpha = d.alpha;
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = d.color;
        ctx.fillText(d.text, d.x, d.y);
        ctx.restore();
        return true;
      });

      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameMode, isGameOver, stage]);

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
          maxWidth: '860px',
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
          DUEL ARENA
        </span>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1f2937', margin: '0 0 16px 0' }}>
          Harry vs. Voldemort
        </h1>

        {/* --- SCREEN 1: MODE SELECTION MENU --- */}
        {gameMode === 'menu' && (
          <div style={{ maxWidth: '440px', margin: '40px auto', padding: '24px' }}>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '15px' }}>
              Choose whether to practice solo against the Voldemort AI bot, or host/join a duel with a friend!
            </p>

            <button
              onClick={startSinglePlayer}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '9999px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
                marginBottom: '14px',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
              }}
            >
              🤖 Play Solo (vs Bot)
            </button>

            <button
              onClick={() => setGameMode('multiplayer_lobby')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '9999px',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              👥 2-Player Room Code Mode
            </button>
          </div>
        )}

        {/* --- SCREEN 2: MULTIPLAYER CODE LOBBY --- */}
        {gameMode === 'multiplayer_lobby' && (
          <div
            style={{
              maxWidth: '440px',
              margin: '30px auto',
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '16px',
            }}
          >
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
                marginBottom: '16px',
              }}
            >
              Create New Room (Play as Harry)
            </button>

            <div style={{ margin: '14px 0', color: '#9ca3af', fontWeight: '600', fontSize: '13px' }}>
              — OR ENTER ROOM CODE —
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
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Join (Voldemort)
              </button>
            </form>

            <button
              onClick={backToMenu}
              style={{
                background: 'none',
                border: 'none',
                color: '#6b7280',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ← Back to Mode Select
            </button>
          </div>
        )}

        {/* --- SCREEN 3: ACTIVE GAMEPLAY (Single Player or Multiplayer) --- */}
        {(gameMode === 'singleplayer' || gameMode === 'multiplayer_active') && (
          <>
            {/* Top HUD */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '14px',
                padding: '10px 20px',
                backgroundColor: '#f3f4f6',
                borderRadius: '16px',
              }}
            >
              {/* Left Combatant */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '700', color: role === 'harry' ? '#b45309' : '#15803d' }}>
                  {role === 'harry' ? '⚡ Harry (You):' : '🐍 Voldemort (You):'}
                </span>
                <span style={{ fontWeight: '800' }}>{playerHp} HP</span>
              </div>

              {/* Mode Specific Info */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '4px 14px',
                  borderRadius: '9999px',
                  border: '1px solid #e5e7eb',
                }}
              >
                {gameMode === 'singleplayer' ? (
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>
                    STAGE {stage} • SCORE: {score}
                  </span>
                ) : (
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#4b5563' }}>
                    ROOM: <span style={{ color: '#3b82f6', letterSpacing: '1px' }}>{roomId}</span>
                  </span>
                )}
              </div>

              {/* Right Combatant */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: '700', color: role === 'harry' ? '#15803d' : '#b45309' }}>
                  {gameMode === 'singleplayer'
                    ? '🐍 Voldemort (AI):'
                    : role === 'harry'
                    ? '🐍 Voldemort (Opponent):'
                    : '⚡ Harry (Opponent):'}
                </span>
                <span style={{ fontWeight: '800' }}>{enemyHp} HP</span>
              </div>
            </div>

            {/* Canvas */}
            <div
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'inline-block',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <canvas ref={canvasRef} width={800} height={440} style={{ display: 'block' }} />
            </div>

            {/* Controls Guide */}
            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'center',
                gap: '18px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#6b7280',
              }}
            >
              <span>🏃 <strong>A/D or ◄/►</strong> Run</span>
              <span>⬆️ <strong>W or ▲</strong> Jitter Jump</span>
              <span>⚡ <strong>Space or J</strong> Cast Spell</span>
              <span>🛡️ <strong>K or Shift</strong> Protego Shield</span>
            </div>

            {/* Status / Game Over Messages */}
            {statusMessage && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '10px 16px',
                  backgroundColor: isGameOver ? '#fef2f2' : '#ecfdf5',
                  borderRadius: '12px',
                  color: isGameOver ? '#b91c1c' : '#065f46',
                  fontSize: '14px',
                  fontWeight: '700',
                }}
              >
                {statusMessage}
              </div>
            )}

            <div style={{ marginTop: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {isGameOver && gameMode === 'singleplayer' && (
                <button
                  onClick={startSinglePlayer}
                  style={{
                    padding: '8px 22px',
                    borderRadius: '9999px',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontWeight: '700',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Play Again
                </button>
              )}
              <button
                onClick={backToMenu}
                style={{
                  padding: '8px 22px',
                  borderRadius: '9999px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  fontWeight: '700',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Exit to Menu
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}