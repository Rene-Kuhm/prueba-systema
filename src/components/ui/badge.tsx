// components/ui/badge.tsx
import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', ...props }) => (
    <span
        className={`px-2 py-1 rounded-full text-sm font-medium ${variant === 'destructive'
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
        {...props}
    >
        {children}
    </span>
);