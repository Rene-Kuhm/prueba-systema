import React from 'react';

export default function CospecLogo() {
    return (
        <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="will-change-transform"
            style={{
                transform: 'translate3d(0,0,0)',
                backfaceVisibility: 'hidden'
            }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                strokeWidth="2"
                className="stroke-blue-500"
                vectorEffect="non-scaling-stroke"
            />
            <path
                d="M8 12 C8 8, 16 8, 16 12"
                strokeWidth="2"
                className="stroke-blue-400"
                vectorEffect="non-scaling-stroke"
            />
            <path
                d="M6 12 C6 6, 18 6, 18 12"
                strokeWidth="2"
                className="stroke-blue-300 opacity-60"
                vectorEffect="non-scaling-stroke"
            />
            <circle
                cx="12"
                cy="12"
                r="2"
                className="fill-blue-500"
            />
        </svg>
    );
}