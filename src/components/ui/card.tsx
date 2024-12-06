interface CardProps {
    children: React.ReactNode
    className?: string
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`bg-white shadow rounded-lg ${className}`}>
        {children}
    </div>
)

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 border-b ${className}`}>
        {children}
    </div>
)

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
    <div className={`px-6 py-4 ${className}`}>
        {children}
    </div>
)

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
    <h3 className={`text-lg font-medium ${className}`}>
        {children}
    </h3>
)