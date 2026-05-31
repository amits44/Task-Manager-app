import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardPage    from './pages/BoardPage';
import LoadingSpinner from './components/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  return !user ? children : <Navigate to="/board" replace />;
};

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<Navigate to="/board" replace />} />
      <Route path="/login"   element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/board"   element={<PrivateRoute><BoardPage /></PrivateRoute>} />
      <Route path="*"        element={<Navigate to="/board" replace />} />
    </Routes>
  );
}
