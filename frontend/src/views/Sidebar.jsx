import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../controllers/authController';
import { useAuth } from '../App';
import BrandMark from './BrandMark';

function Sidebar() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  return (
    <aside className="sidebar">
      <Link to="/explain" className="brand">
        <BrandMark />
        Samjhao
      </Link>

      <nav className="sidebar-nav" aria-label="App">
        <NavLink to="/explain" end className="sidebar-link">
          Explain Document
        </NavLink>
        <NavLink to="/history" className="sidebar-link">
          History
        </NavLink>
        <button
          type="button"
          className="sidebar-link"
          onClick={() => logout(navigate, setUser)}
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
