import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer">
            <div className="container footer-inner">

                <div className="footer-brand">
                    <Link to="/" className="footer-logo">
                        🎮 <span>GameVerse</span>
                    </Link>

                    <p>
                        Play. Compete. Have Fun.
                    </p>
                </div>

                <div className="footer-links">
                    <Link to="/games">Games</Link>
                    <Link to="/leaderboard">Leaderboard</Link>
                    <Link to="/about">About</Link>
                </div>

                <div className="footer-copy">
                    <span>© 2026 GameVerse</span>
                    <span>Made for fun & games ✨</span>
                </div>

            </div>
        </footer>
    );
}

export default Footer;