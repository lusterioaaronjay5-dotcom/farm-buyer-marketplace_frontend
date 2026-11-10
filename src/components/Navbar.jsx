import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = getStoredUser();
  const loggedIn = Boolean(token && user);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  }

  return (
    <header className="nav">
      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>

        {loggedIn ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <button type="button" className="nav-logout" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/about">About Us</NavLink>
            <NavLink to="/service">Service</NavLink>
            <NavLink to="/register">Sign Up</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}