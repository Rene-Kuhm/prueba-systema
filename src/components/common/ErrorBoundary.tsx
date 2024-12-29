import React from 'react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error boundary caught error:', error, errorInfo);
        this.setState({
            hasError: true,
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return (
                <div className="flex items-center justify-center min-h-screen p-4">
                    <div className="max-w-xl text-center">
                        <h1 className="text-xl text-red-500">Error al cargar el contenido</h1>
                        <p className="mt-2 text-gray-600">
                            {this.state.error.message || 'Error desconocido'}
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <pre className="p-4 mt-4 overflow-auto text-xs text-left text-gray-500 bg-gray-100 rounded">
                                {this.state.error.stack}
                                {this.state.errorInfo.componentStack}
                            </pre>
                        )}
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                            Recargar página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;