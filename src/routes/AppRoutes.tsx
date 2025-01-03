import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { ProtectedRoute } from '@/components/common/auth/ProtectedRoute';
import UnauthorizedRoute from '@/components/common/auth/UnauthorizedRoute';

// Lazy loading de componentes
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const AdminRoutes = lazy(() => import('@/routes/AdminRoutes'));
const TechnicianRoutes = lazy(() => import('@/routes/TechnicianRoutes'));
const NotFound = lazy(() => import('@/components/common/NotFound'));

const AppRoutes: React.FC = () => {
    const { currentUser } = useAuth();

    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={
                    <UnauthorizedRoute>
                        <Login />
                    </UnauthorizedRoute>
                } />
                <Route path="/signup" element={
                    <UnauthorizedRoute>
                        <Signup />
                    </UnauthorizedRoute>
                } />
                <Route path="/forgot-password" element={
                    <UnauthorizedRoute>
                        <ForgotPassword />
                    </UnauthorizedRoute>
                } />

                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        <Navigate to={currentUser?.role ? `/${currentUser.role}` : '/login'} replace />
                    </ProtectedRoute>
                } />

                <Route path="/admin/*" element={
                    <ProtectedRoute role="admin">
                        <AdminRoutes />
                    </ProtectedRoute>
                } />
                <Route path="/technician/*" element={
                    <ProtectedRoute role="technician">
                        <TechnicianRoutes />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<NotFound />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;

