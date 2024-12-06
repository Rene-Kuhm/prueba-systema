import React, { useEffect, useRef } from 'react';
import './DashboardCard.css';

interface DashboardCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    variant: 'users' | 'claims' | 'techs';
}

export const DashboardCard = ({
    title,
    value,
    icon,
    variant
}: DashboardCardProps) => {
    const cardRef = useRef<HTMLDivElement>(null);

    // Efecto de brillo que sigue al mouse
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / card.clientWidth) * 100;
            const y = ((e.clientY - rect.top) / card.clientHeight) * 100;

            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        };

        card.addEventListener('mousemove', handleMouseMove);
        return () => card.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Animar el contador
    const [displayValue, setDisplayValue] = React.useState(0);

    useEffect(() => {
        const duration = 1000;
        const steps = 20;
        const stepValue = value / steps;
        const stepDuration = duration / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += stepValue;
            if (current >= value) {
                setDisplayValue(value);
                clearInterval(timer);
            } else {
                setDisplayValue(Math.floor(current));
            }
        }, stepDuration);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <div
            ref={cardRef}
            className={`dashboard-card ${variant}`}
        >
            <div className="dashboard-card-content">
                <div className="dashboard-card-text">
                    <h3 className="dashboard-card-title">{title}</h3>
                    <p className="dashboard-card-value">{displayValue.toLocaleString()}</p>
                </div>
                <div className="dashboard-card-icon">
                    {icon}
                </div>
            </div>
        </div>
    );
};