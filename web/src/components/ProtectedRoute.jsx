import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ role, children }) {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (role && session.user.role !== role) {
    return <Navigate to={session.user.role === 'tenant' ? '/tenant' : '/mahasiswa'} replace />;
  }
  return children;
}
