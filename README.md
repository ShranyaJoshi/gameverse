# 🎮 GameVerse

[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen.svg)](https://gameverse-phi.vercel.app)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-ready, full-stack web gaming platform built with React, HTML5 Canvas, and Supabase. GameVerse delivers classic retro arcade action and tactical turn-based strategy directly in the browser—offering responsive solo AI, real-time multiplayer over WebSockets, live Postgres-driven leaderboards, and persistent player stats.

**Play Live:** [https://gameverse-phi.vercel.app](https://gameverse-phi.vercel.app)

---

## 📸 Screenshots & Highlights

| Arcade Hub & Matchmaking | Live Realtime Leaderboard |
| :---: | :---: |
| Browse games, filter modes, and spin up 4-letter private lobbies. | Filter by game category and track scores updated instantly via Postgres replication. |

---

## ✨ Core Features

- **Dual-Mode Gameplay Engine:**
  - **Solo Mode:** Offline-capable practice powered by responsive heuristic bots and classic arcade loops.
  - **Online 2-Player Duels:** Ephemeral, peer-to-peer style multiplayer using unique 4-letter room codes.
- **Serverless Real-Time Sync:** Low-latency state synchronization utilizing Supabase Broadcast channels—no dedicated Node.js/Socket.io backend required.
- **Dynamic Leaderboard & Live Feeds:** Instant ranking recalculation powered by PostgreSQL Change Data Capture (`supabase_realtime`).
- **Player Profiles & Stats Tracking:** Historical match logging, aggregate scores, personal bests, and account management.
- **Session Authentication:** Secure sign-up, session restoration, and protected routes via Supabase Auth.
- **Lightweight 2D Canvas Engine:** Zero external physics engines; hand-crafted render loops and frame-independent math for peak 60 FPS performance.

---

## 🕹️ Featured Games

| Game | Category | Engine / Architecture | Key Mechanics |
| :--- | :--- | :--- | :--- |
| **Snake** | Retro Arcade | HTML5 Canvas 2D | Grid boundary collision, dynamic fruit spawning, dual-snake head-to-head collision detection in 2P mode. |
| **Tic Tac Toe** | Classic Strategy | React State & Broadcast | Heuristic bot with win/block lookahead, instant broadcast turn toggling, win-line highlights. |
| **Connect 4** | Vertical Strategy | React State & Broadcast | 7x6 gravity disc drops, multi-directional 4-in-a-row matrix scanning, live column drop synchronization. |
| **Battle Arena** | Action Combat | HTML5 Canvas 2D Loop | Harry Potter vs. Lord Voldemort wand combat with Mario-style jitter jumps, Protego shielding, and spell projectile beams. |

---

## 🛠️ Architecture & Tech Stack

```text
┌─────────────────────────────────────────────────────────────┐
│                       Client (Vite + React)                 │
│  ┌──────────────┐   ┌──────────────────┐   ┌─────────────┐  │
│  │ HTML5 Canvas │   │ React Router DOM │   │  Inter UI   │  │
│  │ Game Loops   │   │ SPA Navigation   │   │  Styling    │  │
│  └──────┬───────┘   └────────┬─────────┘   └──────┬──────┘  │
└─────────┼────────────────────┼────────────────────┼─────────┘
          │                    │                    │
          ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     Supabase BaaS Engine                    │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │  Broadcast Channels   │       │  PostgreSQL Database  │  │
│  │  (Room Code Synced)   │       │  (RLS Enabled Tables) │  │
│  └───────────────────────┘       └───────────────────────┘  │
│  ┌───────────────────────┐       ┌───────────────────────┐  │
│  │     Supabase Auth     │       │ Realtime Replication  │  │
│  │   (JWT Sessions)      │       │ (Postgres Changes)    │  │
│  └───────────────────────┘       └───────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
