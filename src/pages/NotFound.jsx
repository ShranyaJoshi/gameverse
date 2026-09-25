import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <main className="not-found section">
            <div className="container">
                <div className="not-found-card card">

                    <div className="not-found-icon">🎮</div>

                    <span className="badge badge-peach">404</span>

                    <h1>Oops! Game Not Found</h1>

                    <p>
                        Looks like this page took a wrong turn.
                        Let's get you back to GameVerse.
                    </p>

                    <div className="not-found-actions">
                        <Link to="/" className="btn btn-primary">
                            🏠 Back to Home
                        </Link>

                        <Link to="/games" className="btn btn-outline">
                            🎮 Explore Games
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default NotFound;