import React, { memo } from 'react';

const CospecLogo = memo(() => (
    <svg
        className="w-12 h-12"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{
            transform: 'translateZ(0)',
            willChange: 'transform',
            containIntrinsicSize: '48px'
        }}
    >
        <circle
            cx="12"
            cy="12"
            r="10"
            className="stroke-blue-500"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
        />
        <path
            d="M8 12 C8 8, 16 8, 16 12"
            className="stroke-blue-400"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
        />
        <path
            d="M6 12 C6 6, 18 6, 18 12"
            className="stroke-blue-300 opacity-60"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
        />
        <circle
            cx="12"
            cy="12"
            r="2"
            className="fill-blue-500"
        />
    </svg>
));

CospecLogo.displayName = 'CospecLogo';
export default CospecLogo;