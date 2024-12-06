// components/ui/avatar.tsx
import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> { }

export const Avatar: React.FC<AvatarProps> = ({ children, ...props }) => (
    <div className="inline-flex items-center justify-center overflow-hidden rounded-full" {...props}>
        {children}
    </div>
);

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> { }

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children, ...props }) => (
    <span className="font-medium text-gray-600 uppercase bg-gray-200" {...props}>
        {children}
    </span>
);