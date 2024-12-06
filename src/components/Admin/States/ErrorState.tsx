import { AlertCircle } from 'lucide-react';
import '../styles/States.css';

interface ErrorStateProps {
  message: string;
}

export const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="error-state">
      <div className="error-container">
        <AlertCircle size={48} className="error-icon" />
        <h2 className="error-title">¡Ups! Algo salió mal</h2>
        <p className="error-message">{message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="error-button"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  );
};