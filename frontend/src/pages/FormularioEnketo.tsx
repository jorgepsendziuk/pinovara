import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './FormularioEnketo.css';

const FormularioEnketo: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  return (
    <div className="dashboard-layout" id="formulario-enketo-page">
      <Sidebar />
      
      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            <div className="header">
              <h1>📄 Visualização do Formulário</h1>
              <p className="subtitle">
                Formulário de pesquisa integrado ao sistema PINOVARA
              </p>
            </div>

            <div className="content">
              <div className="formulario-section">

                {isLoading && (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando formulário...</p>
                  </div>
                )}

                {hasError && (
                  <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Erro ao carregar formulário</h3>
                    <p>Não foi possível carregar o formulário. Verifique sua conexão com a internet.</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">
                      Tentar novamente
                    </button>
                  </div>
                )}

                <iframe
                  src="https://enketo.ona.io/x/lVd7SL0J"
                  title="Formulário Enketo"
                  className={`enketo-iframe ${isLoading ? 'loading' : ''} ${hasError ? 'error' : ''}`}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-popups"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FormularioEnketo;
