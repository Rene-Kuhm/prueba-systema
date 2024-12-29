import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppRoutes from './AppRoutes';

const router = createBrowserRouter(
    [
        {
            path: '/*',
            element: <AppRoutes />,
        }
    ],
    {
        // Opciones de configuración compatibles con la versión actual
        future: {
            v7_relativeSplatPath: true
        }
    }
);

export default function RouterConfig() {
    return <RouterProvider router={router} />;
}