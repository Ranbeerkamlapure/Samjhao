import { Link, NavLink } from 'react-router-dom';
import BrandMark from './BrandMark';

function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <BrandMark />
        Samjhao
      </Link>

      <nav className="navbar-links" aria-label="Primary">
        <NavLink to="/" end>
          Home
        </NavLink>
        <a href="/#how-it-works">How It Works</a>
        <a href="/#privacy">Privacy</a>
      </nav>

      <div className="navbar-actions">
        <Link to="/login" className="btn btn-secondary">
          Log In
        </Link>
        <Link to="/signup" className="btn btn-primary">
          Sign Up
        </Link>
      </div>
    </header>
  );
}

export default Navbar;
