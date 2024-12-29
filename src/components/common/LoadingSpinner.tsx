import React from 'react';

const LoadingSpinner = () => (
    <div className='flex items-center justify-center min-h-screen'>
        <div className='w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin'></div>
    </div>
);

export default LoadingSpinner;