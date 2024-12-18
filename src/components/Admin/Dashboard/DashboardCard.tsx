import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
    const [displayValue, setDisplayValue] = useState(0);

    // Efecto para la animación del contador
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

    // Configuración de variantes
    const variantStyles = {
        users: "bg-gradient-to-br from-blue-500/10 to-blue-500/30 hover:from-blue-500/20 hover:to-blue-500/40 dark:from-blue-400/10 dark:to-blue-400/30",
        claims: "bg-gradient-to-br from-emerald-500/10 to-emerald-500/30 hover:from-emerald-500/20 hover:to-emerald-500/40 dark:from-emerald-400/10 dark:to-emerald-400/30",
        techs: "bg-gradient-to-br from-purple-500/10 to-purple-500/30 hover:from-purple-500/20 hover:to-purple-500/40 dark:from-purple-400/10 dark:to-purple-400/30"
    };

    const iconStyles = {
        users: "text-blue-600 dark:text-blue-400",
        claims: "text-emerald-600 dark:text-emerald-400",
        techs: "text-purple-600 dark:text-purple-400"
    };

    const getValueDisplay = () => {
        // Si es un porcentaje (para la eficiencia mensual)
        if (title.toLowerCase().includes('eficiencia')) {
            return `${displayValue}%`;
        }
        // Para otros valores numéricos
        return displayValue.toLocaleString();
    };

    return (
        <Card className={cn(
            "relative overflow-hidden transition-all duration-300 group",
            "hover:shadow-lg hover:-translate-y-1",
            "border-0",
            "dark:bg-gray-800/50",
            variantStyles[variant]
        )}>
            {/* Efecto de brillo */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rotate-45 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
            </div>

            <div className="p-6 flex items-center justify-between">
                <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground dark:text-gray-300">
                        {title}
                    </h3>
                    <p className={cn(
                        "text-3xl font-bold tracking-tight",
                        iconStyles[variant]
                    )}>
                        {getValueDisplay()}
                    </p>
                </div>
                
                <div className={cn(
                    "p-4 rounded-full",
                    "bg-white/10 backdrop-blur-sm dark:bg-black/10",
                    iconStyles[variant],
                    "transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                )}>
                    {icon}
                </div>
            </div>

            {/* Barra de progreso con animación */}
            <div className="relative h-1 w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/10 to-transparent opacity-50" />
                <div 
                    className={cn(
                        "absolute h-full bg-current transition-all duration-1000 ease-out opacity-25",
                        iconStyles[variant]
                    )}
                    style={{ 
                        width: `${(displayValue / value) * 100}%`,
                    }}
                />
            </div>
        </Card>
    );
};