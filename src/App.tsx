import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
//import SomeComponent from '@/components/SomeComponent';

// Lazy load components for better performance
const Admin = lazy(() => import('./pages/Admin'));
// const Technician = lazy(() => import('@/pages/Technician'));

function App() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
      {/* <SomeComponent /> */}
    </Suspense>
  );
}

export default App;
