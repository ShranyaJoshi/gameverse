import { Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Dashboard from './pages/Dashboard';
import Games from './pages/Games';
import About from './pages/About';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

// Games
import Snake from './games/Snake';
import TicTacToe from './games/TicTacToe';
import Connect4 from './games/Connect4';
import BattleArena from './games/BattleArena';

export default function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#fdfbf7',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Home Landing Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Dedicated Games Catalog */}
          <Route path="/games" element={<Games />} />

          {/* Dedicated Leaderboard */}
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Dedicated About */}
          <Route path="/about" element={<About />} />

          {/* User Auth & Stats Profile */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />

          {/* Individual Games */}
          <Route path="/games/snake" element={<Snake />} />
          <Route path="/games/tictactoe" element={<TicTacToe />} />
          <Route path="/games/connect4" element={<Connect4 />} />
          <Route path="/games/battle" element={<BattleArena />} />

          {/* Fallback */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}