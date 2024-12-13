import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useSearchParams, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Admin from './pages/Admin';

// Componente para manejar las acciones de autenticación
const AuthAction: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  switch (mode) {
    case 'resetPassword':
      return <ResetPassword />;
    default:
      return <Navigate to="/" />;
  }
};

const App: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(function(registration) {
          console.log('Service Worker registrado con éxito:', registration.scope);
        }).catch(function(err) {
          console.log('Error al registrar el Service Worker:', err);
        });
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/__/auth/action" element={<AuthAction />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/technician"
          element={
            <ProtectedRoute role="technician">
              <Technician />
            </ProtectedRoute>
          }
        /> */}

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            <div className="py-8 text-center">
              <h1 className="text-2xl font-bold text-red-500">404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;