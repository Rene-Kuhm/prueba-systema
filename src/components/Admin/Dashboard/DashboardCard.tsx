import React from 'react';

interface DashboardCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    variant: 'techs' | 'claims' | 'users';
    additionalInfo?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    value,
    icon,
    variant,
    additionalInfo
}) => {
    const getVariantStyle = () => {
        switch (variant) {
            case 'techs':
                return 'bg-blue-100 text-blue-600';
            case 'claims':
                return 'bg-green-100 text-green-600';
            case 'users':
                return 'bg-purple-100 text-purple-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="p-6 rounded-lg shadow-md bg-blue-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                <div className={`p-3 rounded-full ${getVariantStyle()}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-2">
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                {additionalInfo && (
                    <p className="text-sm text-gray-500 mt-1">{additionalInfo}</p>
                )}
            </div>
        </div>
    );
};