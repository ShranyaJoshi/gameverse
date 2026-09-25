# 🎮 GameVerse

A full-stack, real-time web gaming portal featuring classic arcade and strategy mini-games with responsive solo AI bots, 4-letter room-code multiplayer, dynamic scoreboards, and persistent player profile statistics.

**Live Demo:** [https://gameverse-phi.vercel.app](https://gameverse-phi.vercel.app)

---

## ✨ Features

- **Dual-Mode Gameplay:**
  - **Solo Mode:** Play offline against responsive heuristic AI bots or practice solo arcade loops.
  - **Online 2-Player Mode:** Create or join private peer-to-peer rooms via 4-letter alphanumeric match codes.
- **Real-Time Multiplayer Synchronization:** Low-latency state broadcasts powered by Supabase Broadcast Channels (no separate backend server required).
- **Global & Game-Specific Leaderboards:** Live score synchronization subscribing to PostgreSQL database changes.
- **Player Profiles & History:** Real-time personal bests, total points, match logs, and dynamic rank titles.
- **Secure Authentication:** User sign-up, sign-in, session recovery, and protected route access managed with Supabase Auth.
- **Lightweight 2D Canvas Engine:** Native HTML5 Canvas render loops with no external physics engine bloat.

---

## 🕹️ Featured Games

| Game | Category | Modes | Description |
| :--- | :--- | :--- | :--- |
| **Snake** | Retro Arcade | Solo & 2P Duel | Classic arena food frenzy. In 2P mode, race on the same arena grid—the first to collide loses! |
| **Tic Tac Toe** | Classic Strategy | Solo AI & 2P Room | 3x3 grid duel with smart bot blocking and instant turn-based multiplayer. |
| **Connect 4** | Vertical Strategy | Solo AI & 2P Room | Gravity-based 7x6 board with complete 4-in-a-row direction validation. |
| **Battle Arena** | Action Combat | Solo & 2P Duel | Harry Potter vs. Lord Voldemort wand combat featuring Mario-style jitter jumps, Protego shields, and projectile beams. |

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/), [Vite](https://vitejs.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Supabase Realtime Channels, Supabase Auth)
- **Graphics & Rendering:** HTML5 Canvas API (2D Context)
- **Styling:** Custom CSS with Inter typography and responsive flex/grid layouts
- **Deployment:** [Vercel](https://vercel.com/)

---

## 📂 Project Structure

```text
gameverse/
├── public/                 # Static public assets (icons, SVGs)
├── src/
│   ├── assets/             # Game sprites, character PNGs
│   ├── components/         # Shared UI (Navbar, Footer)
│   ├── games/              # Mini-game implementations
│   │   ├── BattleArena.jsx # Wand duel combat loop & physics
│   │   ├── Connect4.jsx    # Connect 4 grid state & bot heuristics
│   │   ├── Snake.jsx       # Canvas loop & coordinate broadcast
│   │   └── TicTacToe.jsx   # 3x3 strategy grid & bot logic
│   ├── pages/              # Portal views
│   │   ├── About.jsx       # Architecture & tech stack overview
│   │   ├── Dashboard.jsx   # Home portal with quick-launch cards
│   │   ├── Games.jsx       # Dedicated arcade catalog
│   │   ├── Leaderboard.jsx # Filterable real-time rankings
│   │   ├── Login.jsx       # Supabase email/password sign-in
│   │   ├── Profile.jsx     # User statistics, match logs, and aggregates
│   │   └── Signup.jsx      # New account registration
│   ├── App.jsx             # Route definitions & layout wrappers
│   ├── main.jsx            # React root mount
│   ├── scoreService.js     # Leaderboard score dispatch utilities
│   └── supabaseClient.js   # Supabase client initialization
├── .env.example            # Sample environment variables
├── .gitignore              # Ignored build artifacts and local secrets
├── package.json            # Project dependencies and npm scripts
├── vercel.json             # SPA routing rewrite rule for Vercel
└── vite.config.js          # Vite bundler configuration
