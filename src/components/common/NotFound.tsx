import React from 'react';

const NotFound: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-red-500">404</h1>
            <p className="text-xl text-gray-600">Página no encontrada</p>
        </div>
    </div>
);

export default NotFound;