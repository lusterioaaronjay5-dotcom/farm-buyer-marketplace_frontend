import { Navigate } from 'react-router-dom';
import Home from './Home';

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
}

export default function HomeRoute() {
  const user = getStoredUser();

  if (user?.role === 'buyer') {
    return <Navigate to="/buyer/dashboard" replace />;
  }

  return <Home />;
}