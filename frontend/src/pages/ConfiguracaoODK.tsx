import React from 'react';
import Sidebar from '../components/Sidebar';
import { Smartphone, QrCode, CheckCircle, Lock, HelpCircle, Wifi } from 'lucide-react';
import './ConfiguracaoODK.css';

const ConfiguracaoODK: React.FC = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      
      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            <div className="header">
              <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Smartphone size={40} />
                Configuração do ODK Collect
              </h1>
              <p className="subtitle">
                Configure seu dispositivo móvel para conectar ao sistema PINOVARA
              </p>
            </div>

            <div className="content">
              <div className="instructions">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={24} />
                  Instruções de Configuração
                </h2>
                
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h3>Instale o ODK Collect</h3>
                    <p>
                      Baixe e instale o aplicativo ODK Collect na Google Play Store para dispositivos Android.
                    </p>
                    <a 
                      href="https://play.google.com/store/apps/details?id=org.odk.collect.android&hl=pt_BR" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-link"
                    >
                      <img 
                        src="https://play.google.com/intl/en_us/badges/static/images/badges/pt-br_badge_web_generic.png" 
                        alt="Disponível no Google Play"
                        style={{ height: '60px', marginTop: '10px' }}
                      />
                    </a>
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
                <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <QrCode size={24} />
                  QR Code de Configuração
                </h2>
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
              <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <HelpCircle size={24} />
                Informações Adicionais
              </h2>
              
              <div className="info-grid">
                <div className="info-card">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lock size={20} />
                    Segurança
                  </h3>
                  <p>
                    Esta configuração utiliza conexão segura e autenticação para garantir que apenas usuários autorizados tenham acesso aos formulários.
                  </p>
                </div>

                <div className="info-card">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={20} />
                    Suporte
                  </h3>
                  <p>
                    Em caso de problemas com a configuração, entre em contato com a equipe de suporte técnico.
                  </p>
                </div>

                <div className="info-card">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Wifi size={20} />
                    Compatibilidade
                  </h3>
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
