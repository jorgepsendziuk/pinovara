import React from 'react';
import Sidebar from '../components/Sidebar';
import './ConfiguracaoODK.css';

const ConfiguracaoODK: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            <div className="header">
              <h1>📱 Configuração do ODK Collect</h1>
              <p className="subtitle">
                Configure seu dispositivo móvel para conectar ao sistema PINOVARA
              </p>
            </div>

            <div className="content">
              <div className="instructions">
                <h2>📋 Instruções de Configuração</h2>
                
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Instale o ODK Collect</h3>
                    <p>
                      Baixe e instale o aplicativo ODK Collect na Google Play Store para dispositivos Android.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h3>Escaneie o QR Code</h3>
                    <p>
                      Use o aplicativo ODK Collect para escanear o QR Code abaixo e configurar automaticamente a conexão com o servidor PINOVARA.
                    </p>
                  </div>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h3>Teste a Conexão</h3>
                    <p>
                      Após escanear o QR Code, teste a conexão baixando um formulário de teste para verificar se tudo está funcionando corretamente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="qr-section">
                <h2>🔗 QR Code de Configuração</h2>
                <div className="qr-container">
                  <img 
                    src="/pinovara_qr_code.png" 
                    alt="QR Code para configuração do ODK Collect" 
                    className="qr-code"
                  />
                </div>
                <p className="qr-description">
                  Escaneie este código com o ODK Collect para configurar automaticamente a conexão com o servidor PINOVARA.
                </p>
              </div>
            </div>

            <div className="additional-info">
              <h2>ℹ️ Informações Adicionais</h2>
              
              <div className="info-grid">
                <div className="info-card">
                  <h3>🔒 Segurança</h3>
                  <p>
                    Esta configuração utiliza conexão segura e autenticação para garantir que apenas usuários autorizados tenham acesso aos formulários.
                  </p>
                </div>

                <div className="info-card">
                  <h3>🛠️ Suporte</h3>
                  <p>
                    Em caso de problemas com a configuração, entre em contato com a equipe de suporte técnico.
                  </p>
                </div>

                <div className="info-card">
                  <h3>📱 Compatibilidade</h3>
                  <p>
                    O ODK Collect é compatível com dispositivos Android, funcionando tanto online quanto offline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConfiguracaoODK;
