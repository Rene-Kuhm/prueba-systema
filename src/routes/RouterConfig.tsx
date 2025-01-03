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
        future: {
            v7_relativeSplatPath: true,
            v7_startTransition: true
        }
    }
);

export default function RouterConfig() {
    return <RouterProvider router={router} />;
}