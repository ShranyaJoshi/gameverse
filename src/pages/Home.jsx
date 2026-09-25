import { Link } from 'react-router-dom';

const FEATURED_GAMES = [
    {
        id: 'tictactoe',
        icon: '❌',
        name: 'Tic-Tac-Toe',
        description: 'Classic 3×3 strategy. Outsmart your opponent in seconds.',
        category: 'Strategy',
        badge: 'badge-sage',
        path: '/games/tictactoe',
    },
    {
        id: 'snake',
        icon: '🐍',
        name: 'Snake',
        description: 'Grow longer, dodge yourself, and chase the high score.',
        category: 'Arcade',
        badge: 'badge-mint',
        path: '/games/snake',
    },
    {
        id: 'connect4',
        icon: '🔴',
        name: 'Connect 4',
        description: 'Drop discs, line up four, and win with clever moves.',
        category: 'Puzzle',
        badge: 'badge-coral',
        path: '/games/connect4',
    },
    {
        id: 'battle',
        icon: '⚔️',
        name: 'Mini Battle Arena',
        description: 'Fast-paced mini battles with quick, action-packed rounds.',
        category: 'Action',
        badge: 'badge-sky',
        path: '/games/battle',
    },
];

const FEATURES = [
    {
        icon: '🎮',
        title: 'Multiple Games',
        description: 'A growing library of pastel-perfect games, all in one cozy place.',
        accent: 'card-mint',
    },
    {
        icon: '🤖',
        title: 'Play With Computer',
        description: 'Sharpen your skills against friendly AI opponents anytime.',
        accent: 'card-sage',
    },
    {
        icon: '📊',
        title: 'Track Your Progress',
        description: 'Watch your wins, streaks, and scores climb over time.',
        accent: 'card-peach',
    },
    {
        icon: '🌐',
        title: 'Multiplayer Ready',
        description: 'Built to grow into a shared arena with friends and rivals.',
        accent: 'card-sky',
    },
];

function Home() {
    return (
        <main className="home">
            {/* ============== HERO ============== */}
            <section className="home-hero section" aria-labelledby="hero-heading">
                <div className="container home-hero-inner">
                    <div className="home-hero-content">
                        <span className="badge badge-mint home-hero-badge">
                            <span aria-hidden="true">✨</span> Welcome to GameVerse
                        </span>

                        <h1 id="hero-heading" className="home-hero-title">
                            Play. Compete. <span className="home-hero-highlight">Have Fun.</span>
                        </h1>

                        <p className="text-lead home-hero-description">
                            A cozy corner of the internet where classic games meet a soft,
                            modern aesthetic. Jump in, challenge yourself, and make every
                            match a little moment of joy.
                        </p>

                        <div className="home-hero-actions">
                            <Link to="/games" className="btn btn-primary btn-lg">
                                Explore Games
                            </Link>
                            <Link to="/games/snake" className="btn btn-outline btn-lg">
                                Play Now
                            </Link>
                        </div>

                        <ul className="home-hero-stats" aria-label="GameVerse highlights">
                            <li>
                                <strong>4+</strong>
                                <span>Games</span>
                            </li>
                            <li>
                                <strong>100%</strong>
                                <span>Free</span>
                            </li>
                            <li>
                                <strong>∞</strong>
                                <span>Fun</span>
                            </li>
                        </ul>
                    </div>

                    <div className="home-hero-visual" aria-hidden="true">
                        <div className="home-hero-blob home-hero-blob-1" />
                        <div className="home-hero-blob home-hero-blob-2" />
                        <div className="home-hero-blob home-hero-blob-3" />
                        <div className="home-hero-card">
                            <div className="home-hero-card-emoji">🎮</div>
                            <div className="home-hero-card-title">GameVerse</div>
                            <div className="home-hero-card-sub">Ready to play?</div>
                            <div className="home-hero-card-dots">
                                <span className="home-hero-dot home-hero-dot-coral" />
                                <span className="home-hero-dot home-hero-dot-yellow" />
                                <span className="home-hero-dot home-hero-dot-sky" />
                            </div>
                        </div>
                        <div className="home-hero-float home-hero-float-1">🕹️</div>
                        <div className="home-hero-float home-hero-float-2">⭐</div>
                        <div className="home-hero-float home-hero-float-3">🏆</div>
                    </div>
                </div>
            </section>

            {/* ============== FEATURED GAMES ============== */}
            <section className="section" aria-labelledby="featured-heading">
                <div className="container">
                    <header className="home-section-header text-center">
                        <span className="badge badge-yellow">Featured</span>
                        <h2 id="featured-heading" className="mt-3">Featured Games</h2>
                        <p className="text-lead mt-2">
                            Handpicked favorites to get you started. Pick one and jump right in.
                        </p>
                    </header>

                    <div className="grid-auto mt-6">
                        {FEATURED_GAMES.map((game) => (
                            <article key={game.id} className="card game-card">
                                <div className="game-card-icon" aria-hidden="true">
                                    {game.icon}
                                </div>
                                <div className="game-card-head">
                                    <h3 className="card-title">{game.name}</h3>
                                    <span className={`badge ${game.badge}`}>{game.category}</span>
                                </div>
                                <p className="game-card-description">{game.description}</p>
                                <div className="card-footer">
                                    <Link
                                        to={game.path}
                                        className="btn btn-primary btn-sm btn-block"
                                    >
                                        Play Now
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============== WHY GAMEVERSE ============== */}
            <section className="section" aria-labelledby="why-heading">
                <div className="container">
                    <header className="home-section-header text-center">
                        <span className="badge badge-sage">Why GameVerse</span>
                        <h2 id="why-heading" className="mt-3">Why You&apos;ll Love It</h2>
                        <p className="text-lead mt-2">
                            Simple to start, satisfying to master — GameVerse is built around you.
                        </p>
                    </header>

                    <div className="grid-auto mt-6">
                        {FEATURES.map((feature) => (
                            <article key={feature.title} className={`card ${feature.accent}`}>
                                <div className="feature-icon" aria-hidden="true">
                                    {feature.icon}
                                </div>
                                <h3 className="card-title mt-3">{feature.title}</h3>
                                <p className="mt-2">{feature.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============== FINAL CTA ============== */}
            <section className="section" aria-labelledby="cta-heading">
                <div className="container">
                    <div className="card home-cta text-center">
                        <span className="badge badge-coral">Let&apos;s Go</span>
                        <h2 id="cta-heading" className="mt-3">
                            Ready to Start Your Streak?
                        </h2>
                        <p className="text-lead mt-2 home-cta-description">
                            Pick a game, make your move, and let the fun begin. Your next
                            high score is only one click away.
                        </p>
                        <div className="home-cta-actions mt-4">
                            <Link to="/games" className="btn btn-secondary btn-lg">
                                Browse All Games
                            </Link>
                            <Link to="/signup" className="btn btn-ghost btn-lg">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

export default Home;