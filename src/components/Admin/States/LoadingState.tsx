import '../styles/States.css';

export const LoadingState = () => {
  return (
    <div className="loading-state">
      <div className="loading-container">
        <h1 className="loading-logo">COSPEC</h1>
        <div className="loading-spinner">
          <div className="loading-spinner-ring"></div>
          <div className="loading-spinner-ring"></div>
          <div className="loading-spinner-ring"></div>
        </div>
        <p className="loading-text">Cargando...</p>
      </div>
    </div>
  );
};