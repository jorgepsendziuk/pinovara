import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface TermosUsoProps {
  onAccept: () => void;
  onDecline: () => void;
}

export const TermosUso: React.FC<TermosUsoProps> = ({ onAccept, onDecline }) => {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
    if (isBottom) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
      }}>
        {/* Cabeçalho */}
        <div style={{
          padding: '24px',
          borderBottom: '2px solid #056839',
          background: '#f8f9fa'
        }}>
          <h2 style={{
            margin: 0,
            color: '#3b2313',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            Termos de Uso
            <button
              onClick={onDecline}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={24} color="#666" />
            </button>
          </h2>
          <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
            Por favor, leia atentamente antes de prosseguir
          </p>
        </div>

        {/* Conteúdo */}
        <div 
          onScroll={handleScroll}
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            lineHeight: '1.8',
            color: '#333'
          }}
        >
          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              1. Aceitação dos Termos
            </h3>
            <p>
              Ao acessar e usar o Sistema PINOVARA, você concorda em cumprir estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não deverá usar o sistema.
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              2. Sobre o Sistema
            </h3>
            <p style={{ marginBottom: '10px' }}>
              O Sistema PINOVARA é uma plataforma desenvolvida no âmbito do projeto de parceria entre 
              o Instituto Nacional de Colonização e Reforma Agrária (INCRA) e a Universidade Federal 
              da Bahia (UFBA), através do Termo de Execução Descentralizado (TED) nº 50/2023.
            </p>
            <p>
              <strong>Desenvolvido por:</strong> LGRDC Serviços de Informática (CNPJ 37.287.587/0001-71)
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              3. Uso Autorizado
            </h3>
            <p style={{ marginBottom: '10px' }}>
              O acesso ao sistema é restrito a:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Usuários autorizados vinculados ao projeto PINOVARA</li>
              <li>Representantes de organizações participantes</li>
              <li>Equipe técnica e administrativa do INCRA e UFBA</li>
              <li>Pesquisadores devidamente autorizados</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              4. Responsabilidades do Usuário
            </h3>
            <p style={{ marginBottom: '10px' }}>
              Ao usar o sistema, você se compromete a:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a confidencialidade de sua senha de acesso</li>
              <li>Não compartilhar suas credenciais com terceiros</li>
              <li>Usar o sistema apenas para fins legítimos relacionados ao projeto</li>
              <li>Não tentar acessar áreas restritas ou dados de outras organizações</li>
              <li>Não realizar ações que possam prejudicar o funcionamento do sistema</li>
              <li>Respeitar os direitos autorais e de propriedade intelectual</li>
              <li>Cumprir todas as leis e regulamentos aplicáveis</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              5. Privacidade e Proteção de Dados
            </h3>
            <p>
              O tratamento de dados pessoais no Sistema PINOVARA está detalhado em nossa 
              <strong> Política de Privacidade</strong>, que complementa estes Termos de Uso e 
              está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              6. Propriedade Intelectual
            </h3>
            <p style={{ marginBottom: '10px' }}>
              Todo o conteúdo do sistema, incluindo mas não limitado a:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Código-fonte e software</li>
              <li>Design e interface</li>
              <li>Textos, imagens e gráficos</li>
              <li>Logos e marcas</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              São de propriedade da LGRDC Serviços de Informática (CNPJ 37.287.587/0001-71), 
              protegidos por leis de direitos autorais e propriedade intelectual.
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              7. Disponibilidade do Sistema
            </h3>
            <p>
              Embora nos esforcemos para manter o sistema disponível 24/7, não garantimos que 
              estará sempre acessível, livre de erros ou interrupções. Reservamo-nos o direito de:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Realizar manutenções programadas ou emergenciais</li>
              <li>Suspender temporariamente o acesso</li>
              <li>Modificar ou descontinuar funcionalidades</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              8. Limitação de Responsabilidade
            </h3>
            <p>
              O Sistema PINOVARA é fornecido "como está". Na extensão máxima permitida por lei, 
              não nos responsabilizamos por:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Perdas ou danos decorrentes do uso do sistema</li>
              <li>Interrupções ou erros no funcionamento</li>
              <li>Perda de dados (embora realizemos backups regulares)</li>
              <li>Ações de terceiros não autorizados</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              9. Suspensão e Cancelamento de Acesso
            </h3>
            <p>
              Reservamo-nos o direito de suspender ou cancelar o acesso de qualquer usuário que:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Viole estes Termos de Uso</li>
              <li>Forneça informações falsas ou enganosas</li>
              <li>Use o sistema de forma inadequada ou ilegal</li>
              <li>Represente risco à segurança do sistema ou de outros usuários</li>
            </ul>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              10. Alterações nos Termos
            </h3>
            <p>
              Estes Termos de Uso podem ser atualizados periodicamente. Alterações significativas 
              serão notificadas através do sistema. O uso continuado após as alterações constitui 
              aceitação dos novos termos.
            </p>
          </section>

          <section style={{ marginBottom: '24px' }}>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              11. Lei Aplicável e Foro
            </h3>
            <p>
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Quaisquer 
              disputas serão resolvidas no foro da Comarca de Salvador, Estado da Bahia.
            </p>
          </section>

          <section>
            <h3 style={{ color: '#056839', fontSize: '18px', marginBottom: '12px' }}>
              12. Contato
            </h3>
            <p>
              Para dúvidas ou questões sobre estes Termos de Uso:
            </p>
            <p style={{ marginTop: '10px', marginLeft: '20px' }}>
              <strong>E-mail:</strong> jorgefrpsendziuk@gmail.com<br />
              <strong>Instituição:</strong> LGRDC Serviços de Informática - CNPJ 37.287.587/0001-71<br />
              <strong>Projeto:</strong> PINOVARA - TED nº 50/2023 INCRA/UFBA
            </p>
          </section>

          {/* Aviso de scroll */}
          {!scrolledToBottom && (
            <div style={{
              position: 'sticky',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(to top, rgba(255,255,255,1) 50%, rgba(255,255,255,0))',
              padding: '30px 0 10px 0',
              textAlign: 'center',
              color: '#056839',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              ↓ Role até o final para aceitar os termos ↓
            </div>
          )}
        </div>

        {/* Rodapé com botões */}
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #ddd',
          background: '#f8f9fa',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onDecline}
            style={{
              padding: '12px 24px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600'
            }}
          >
            Recusar
          </button>
          <button
            onClick={onAccept}
            disabled={!scrolledToBottom}
            style={{
              padding: '12px 24px',
              background: scrolledToBottom ? '#056839' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
              fontSize: '15px',
              fontWeight: '600',
              opacity: scrolledToBottom ? 1 : 0.6
            }}
          >
            Aceitar e Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermosUso;

