// components/ui/scroll-area.tsx
import React from 'react';

export const ScrollArea: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => (
    <div className="overflow-auto" {...props}>
        {children}
    </div>
);