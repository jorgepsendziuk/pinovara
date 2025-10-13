import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function PoliticaPrivacidade() {
  const navigate = useNavigate();

  // Scroll para o topo ao abrir a página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f9fa',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            background: '#056839',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Voltar
        </button>

        {/* Cabeçalho */}
        <div style={{
          borderBottom: '2px solid #056839',
          paddingBottom: '20px',
          marginBottom: '30px'
        }}>
          <h1 style={{
            color: '#3b2313',
            fontSize: '28px',
            marginBottom: '10px'
          }}>
            Política de Privacidade
          </h1>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Conteúdo */}
        <div style={{ lineHeight: '1.8', color: '#333' }}>
          
          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              1. Identificação do Controlador e do Desenvolvedor
            </h2>
            <p style={{ marginBottom: '10px' }}>
              <strong>Contratante/Controlador:</strong><br />
              Universidade Federal da Bahia (UFBA)<br />
              Projeto PINOVARA - Plataforma de Inovação Agroecológica<br />
              Parceria INCRA/UFBA - TED nº 50/2023
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Desenvolvedor do Sistema:</strong><br />
              LGRDC Serviços de Informática<br />
              CNPJ: 37.287.587/0001-71
            </p>
            <p>
              <strong>Encarregado de Dados (DPO):</strong><br />
              Jorge Psendziuk<br />
              Contato: jorgefrpsendziuk@gmail.com
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              2. Finalidade do Tratamento de Dados
            </h2>
            <p style={{ marginBottom: '10px' }}>
              O Sistema PINOVARA coleta e processa dados pessoais com as seguintes finalidades:
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '10px' }}>
              <li>Cadastro e gestão de organizações participantes do projeto</li>
              <li>Registro de dados de representantes legais das organizações</li>
              <li>Coleta de informações socioeconômicas e ambientais</li>
              <li>Georreferenciamento de perímetros e territórios</li>
              <li>Elaboração de diagnósticos e relatórios técnicos</li>
              <li>Autenticação e controle de acesso ao sistema</li>
              <li>Comunicação institucional relacionada ao projeto</li>
              <li>Cumprimento de obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              3. Dados Coletados
            </h2>
            <p style={{ marginBottom: '10px' }}>
              <strong>3.1. Dados de Usuários do Sistema:</strong>
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li>Nome completo</li>
              <li>E-mail</li>
              <li>Senha (armazenada com criptografia)</li>
              <li>Data de registro</li>
              <li>Permissões e papéis no sistema</li>
            </ul>

            <p style={{ marginBottom: '10px' }}>
              <strong>3.2. Dados das Organizações:</strong>
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li>Nome da organização</li>
              <li>CNPJ</li>
              <li>Endereço completo</li>
              <li>Telefone e e-mail institucional</li>
              <li>Coordenadas geográficas (GPS)</li>
              <li>Dados socioeconômicos e ambientais</li>
              <li>Informações sobre produção e gestão</li>
            </ul>

            <p style={{ marginBottom: '10px' }}>
              <strong>3.3. Dados dos Representantes:</strong>
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li>Nome completo</li>
              <li>CPF</li>
              <li>RG</li>
              <li>Telefone</li>
              <li>E-mail</li>
              <li>Endereço residencial</li>
              <li>Função na organização</li>
            </ul>

            <p style={{ marginBottom: '10px' }}>
              <strong>3.4. Dados Coletados Automaticamente:</strong>
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Endereço IP</li>
              <li>Informações do navegador (user agent)</li>
              <li>Data e hora de acesso</li>
              <li>Páginas visitadas</li>
              <li>Cookies técnicos e funcionais</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              4. Base Legal para o Tratamento
            </h2>
            <p style={{ marginBottom: '10px' }}>
              O tratamento de dados pessoais no Sistema PINOVARA fundamenta-se nas seguintes bases legais previstas na Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Execução de contrato:</strong> Art. 7º, V - para cadastro e gestão das organizações participantes</li>
              <li><strong>Cumprimento de obrigação legal:</strong> Art. 7º, II - relatórios exigidos pelo INCRA e legislação aplicável</li>
              <li><strong>Execução de políticas públicas:</strong> Art. 7º, III - em razão do TED nº 50/2023 INCRA/UFBA</li>
              <li><strong>Consentimento:</strong> Art. 7º, I - para dados opcionais e comunicações não obrigatórias</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              5. Compartilhamento de Dados
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Os dados coletados poderão ser compartilhados nas seguintes situações:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>INCRA:</strong> Como parte do projeto de parceria (TED nº 50/2023)</li>
              <li><strong>UFBA:</strong> Para fins acadêmicos, de pesquisa e extensão</li>
              <li><strong>Órgãos Públicos:</strong> Quando exigido por lei ou ordem judicial</li>
              <li><strong>Prestadores de Serviço:</strong> Limitado ao necessário para operação do sistema (hospedagem, infraestrutura)</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              <strong>Não compartilhamos dados com terceiros para fins comerciais ou publicitários.</strong>
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              6. Segurança dos Dados
            </h2>
            <p style={{ marginBottom: '10px' }}>
              Implementamos medidas técnicas e organizacionais para proteger seus dados:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Criptografia de senhas com bcrypt</li>
              <li>Autenticação via JWT (JSON Web Token)</li>
              <li>Controle de acesso baseado em papéis e permissões</li>
              <li>Conexões seguras via HTTPS</li>
              <li>Backups regulares do banco de dados</li>
              <li>Logs de auditoria de ações no sistema</li>
              <li>Firewall e proteção contra acessos não autorizados</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              7. Retenção de Dados
            </h2>
            <p>
              Os dados pessoais serão mantidos pelo período necessário para cumprir as finalidades descritas nesta política, observando:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Dados de usuários:</strong> Até exclusão da conta ou 5 anos de inatividade</li>
              <li><strong>Dados das organizações:</strong> Durante a vigência do projeto e por 5 anos após o encerramento, conforme exigências legais</li>
              <li><strong>Logs de acesso:</strong> 6 meses</li>
              <li><strong>Dados para cumprimento legal:</strong> Conforme prazo estabelecido em lei</li>
            </ul>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              8. Direitos dos Titulares (LGPD)
            </h2>
            <p style={{ marginBottom: '10px' }}>
              De acordo com a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Confirmação e acesso:</strong> Confirmar se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização, bloqueio ou eliminação:</strong> De dados desnecessários ou tratados em desconformidade</li>
              <li><strong>Portabilidade:</strong> Solicitar transferência dos dados a outro fornecedor</li>
              <li><strong>Eliminação:</strong> Dos dados tratados com base no consentimento</li>
              <li><strong>Informação sobre compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
              <li><strong>Revogação do consentimento:</strong> Quando aplicável</li>
              <li><strong>Oposição:</strong> Opor-se a tratamento realizado sem consentimento</li>
            </ul>
            <p style={{ marginTop: '15px' }}>
              <strong>Para exercer seus direitos, entre em contato com o DPO:</strong><br />
              E-mail: jorgefrpsendziuk@gmail.com<br />
              Assunto: "Exercício de Direitos LGPD"
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              9. Cookies
            </h2>
            <p style={{ marginBottom: '10px' }}>
              O sistema utiliza cookies para:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li><strong>Cookies essenciais:</strong> Autenticação e funcionamento do sistema</li>
              <li><strong>Cookies de preferências:</strong> Lembrar suas escolhas (ex: aceite de termos)</li>
            </ul>
            <p style={{ marginTop: '10px' }}>
              Você pode configurar seu navegador para recusar cookies, mas isso pode afetar o funcionamento do sistema.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              10. Alterações nesta Política
            </h2>
            <p>
              Esta Política de Privacidade pode ser atualizada periodicamente. Notificaremos sobre alterações significativas através do sistema ou por e-mail. A data da última atualização está indicada no início deste documento.
            </p>
          </section>

          <section style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              11. Contato
            </h2>
            <p>
              Para dúvidas, solicitações ou reclamações sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais:
            </p>
            <p style={{ marginTop: '10px', marginLeft: '20px' }}>
              <strong>Encarregado de Dados (DPO):</strong> Jorge Psendziuk<br />
              <strong>E-mail:</strong> jorgefrpsendziuk@gmail.com
            </p>
          </section>

          <section>
            <h2 style={{ color: '#056839', fontSize: '20px', marginBottom: '15px' }}>
              12. Legislação Aplicável
            </h2>
            <p>
              Esta Política de Privacidade é regida pela legislação brasileira, em especial:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Lei nº 13.709/2018 - Lei Geral de Proteção de Dados Pessoais (LGPD)</li>
              <li>Lei nº 12.965/2014 - Marco Civil da Internet</li>
              <li>Decreto nº 8.771/2016 - Regulamentação do Marco Civil</li>
            </ul>
          </section>

        </div>

        {/* Rodapé */}
        <div style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid #ddd',
          textAlign: 'center',
          color: '#666',
          fontSize: '14px'
        }}>
          <p>© 2025 PINOVARA - Universidade Federal da Bahia</p>
          <p>Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}

export default PoliticaPrivacidade;

