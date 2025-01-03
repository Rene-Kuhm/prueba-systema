// src/components/Admin/StatsCard/index.tsx
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface StatsCardProps {
    title: string;
    value: number;
    subtitle?: string;
}

export const StatsCard = ({ title, value, subtitle }: StatsCardProps) => (
    <Card>
        <CardHeader className="stats-card-content">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="stats-value">{value}</div>
            {subtitle && <p className="stats-subtitle">{subtitle}</p>}
        </CardContent>
    </Card>
);