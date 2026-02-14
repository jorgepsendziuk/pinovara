import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';
import './ParecerTecnico.css';

export default function ParecerTecnico() {
  const navigate = useNavigate();
  usePageTitle('Parecer Técnico - Aditivo Contrato PINOVARA');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="parecer-tecnico">
      <div className="parecer-tecnico__toolbar no-print">
        <button type="button" className="parecer-tecnico__btn-back" onClick={() => navigate(-1)}>
          ← Voltar
        </button>
        <button type="button" className="parecer-tecnico__btn-print" onClick={() => window.print()}>
          Imprimir / Salvar PDF
        </button>
      </div>

      <article className="parecer-tecnico__doc">
        <header className="parecer-tecnico__header">
          <h1 className="parecer-tecnico__title">Parecer Técnico</h1>
          <p className="parecer-tecnico__subtitle">
            Serviços prestados no âmbito do Contrato — Sistema Integrado PINOVARA
          </p>
        </header>

        <section className="parecer-tecnico__section">
          <h2>1. Identificação</h2>
          <p>
            <strong>Objeto do contrato:</strong> Contratação de pessoa jurídica especializada para
            apoiar o desenvolvimento, implantação, capacitação, manutenção e suporte de sistema
            integrado de coleta e gerenciamento de dados socioeconômicos, ambientais e do Relatório
            Técnico de Identificação e Delimitação (RTID), para atendimento ao Projeto Inovador em
            Gestão do PNRA (PINOVARA).
          </p>
          <p>
            <strong>Número da OF:</strong> 107611 &nbsp;|&nbsp; <strong>Instrumento:</strong> 106/2023
            &nbsp;|&nbsp; <strong>Aditivo pleiteado:</strong> Contrato nº 2025013135
          </p>
          <p>
            <strong>Status da execução objeto deste parecer:</strong> cronograma da primeira fase
            concluído em 100%, conforme relatório de execução entregue.
          </p>
        </section>

        <section className="parecer-tecnico__section">
          <h2>2. Objeto e escopo</h2>
          <p>
            O contrato previa a entrega de infraestrutura (servidores de recepção, publicação e
            banco de dados), formulários de cadastro socioeconômico para famílias de territórios
            quilombolas e empreendimentos coletivos, formulários de mobilização e eventos, sistema
            de recebimento de coleta em campo, bancos de dados de recepção e publicação, website
            institucional, portal de gestão de dados de coletas e portal de controle
            administrativo. O presente parecer atesta as entregas técnicas correspondentes a cada
            etapa executada.
          </p>
        </section>

        <section className="parecer-tecnico__section">
          <h2>3. Relato técnico por etapa</h2>
          <p className="parecer-tecnico__intro-table">
            A tabela a seguir relaciona cada etapa do cronograma concluído às entregas técnicas
            realizadas no sistema.
          </p>
          <div className="parecer-tecnico__table-wrap">
            <table className="parecer-tecnico__table">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Especificação (contrato)</th>
                  <th>Entregas técnicas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Instalação, configuração e manutenção do servidor de recepção</td>
                  <td>
                    Infraestrutura em produção (servidor de recepção de dados coletados em campo),
                    pipeline de deploy (GitHub Actions), configuração Docker e Nginx.
                  </td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Instalação, configuração e manutenção do servidor de publicação</td>
                  <td>
                    Servidor de publicação em produção; aplicação web (frontend e API) publicada e
                    acessível; configuração de domínio e SSL.
                  </td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Instalação e configuração do servidor de banco de dados</td>
                  <td>
                    PostgreSQL em produção; uso de Prisma ORM; documentação de configuração e
                    acesso ao banco (setup unificado, acesso externo).
                  </td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Formulários de cadastro socioeconômico (famílias quilombolas e empreendimentos)</td>
                  <td>
                    Formulários ODK para organizações (cooperativas, associações, empreendimentos
                    familiares) e para famílias (supervisão ocupacional); backend com controllers e
                    services dedicados (organização, supervisão ocupacional); documentação de
                    estrutura, mapeamento e validações dos formulários.
                  </td>
                </tr>
                <tr>
                  <td>5</td>
                  <td>Formulários de mobilização e eventos</td>
                  <td>
                    Módulo de qualificações e capacitações; formulários de inscrição, avaliação e
                    gestão de presença; integração com eventos e seminários; painel do instrutor e
                    calendário de capacitações.
                  </td>
                </tr>
                <tr>
                  <td>6</td>
                  <td>Implantação do sistema de recebimento de coleta em campo</td>
                  <td>
                    Integração com ODK Aggregate; sincronização de formulários, fotos, arquivos e
                    assinaturas; páginas de configuração ODK e sincronização geral (admin); serviços
                    de sync (ODK, fotos, arquivos, assinaturas) e documentação da sincronização.
                  </td>
                </tr>
                <tr>
                  <td>7</td>
                  <td>Estruturação do banco de dados de recepção</td>
                  <td>
                    Schema Prisma com tabelas do domínio (organização, abrangência, produção,
                    arquivos, fotos); integração com dados recebidos via ODK (incl. dblink/funções
                    para mídia e assinaturas); schema auxiliar (estados, municípios, funções,
                    respostas).
                  </td>
                </tr>
                <tr>
                  <td>8</td>
                  <td>Implantação do banco de dados de publicação</td>
                  <td>
                    Mesmo banco PostgreSQL com dados consolidados para consulta e publicação;
                    utilização em relatórios, listagens e portal de gestão.
                  </td>
                </tr>
                <tr>
                  <td>9</td>
                  <td>Desenvolvimento do website institucional</td>
                  <td>
                    Página inicial (landing), política de privacidade, repositório público,
                    páginas de capacitação e avaliação públicas; identidade visual e informativa
                    do projeto PINOVARA.
                  </td>
                </tr>
                <tr>
                  <td>10</td>
                  <td>Desenvolvimento do portal de gestão de dados de coletas</td>
                  <td>
                    Módulos: Organizações (lista, cadastro, edição, detalhes, mapa, dashboard);
                    Supervisão Ocupacional (famílias, glebas, mapa de cadastros, edição e detalhes);
                    Qualificações/Capacitações (lista, calendário, gestão de avaliações e presença).
                    Listagens com filtros, mapas georreferenciados e fluxos de edição e validação.
                  </td>
                </tr>
                <tr>
                  <td>11</td>
                  <td>Desenvolvimento do portal de controle administrativo</td>
                  <td>
                    Painel administrativo: gestão de usuários, módulos e permissões (roles),
                    logs de auditoria, configurações do sistema, backup, monitoramento do sistema,
                    painel de analytics e sincronização ODK geral; controle de acesso por JWT e
                    permissões por módulo.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="parecer-tecnico__section">
          <h2>4. Etapas futuras — aditivo contratual</h2>
          <p>
            A continuidade do serviço depende do aditivo ao Contrato nº 2025013135. Sem as etapas
            futuras descritas abaixo, a infraestrutura e os sistemas entregues deixariam de contar
            com manutenção e evolução adequadas, com risco de descontinuidade operacional e
            desalinhamento em relação às metas do TED e do Plano de Trabalho. O aditivo proposto
            não se limita à manutenção: inclui a atualização dos formulários de supervisão
            ocupacional e de mobilização e seminários com foco nas áreas quilombolas, a manutenção
            e atualização do website e dos portais de gestão e administrativo, e ainda o
            desenvolvimento de relatórios e do repositório de arquivos e relatórios, ampliando a
            utilidade do sistema para a gestão e a divulgação dos dados do PINOVARA.
          </p>
          <p>
            As etapas propostas, com respectivos desembolsos, são as seguintes:
          </p>
          <div className="parecer-tecnico__table-wrap">
            <table className="parecer-tecnico__table">
              <thead>
                <tr>
                  <th>Etapa</th>
                  <th>Especificação</th>
                  <th>Desembolso</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>1</td><td>Provisionamento e manutenção do servidor de recepção de dados coletados em campo.</td><td>5%</td></tr>
                <tr><td>2</td><td>Provisionamento e manutenção do servidor de publicação de dados.</td><td>5%</td></tr>
                <tr><td>3</td><td>Provisionamento e manutenção do servidor de banco de dados.</td><td>5%</td></tr>
                <tr><td>4</td><td>Manutenção do sistema de recebimento de coleta de dados em campo.</td><td>5%</td></tr>
                <tr><td>5</td><td>Manutenção, atualização e adequação do banco de dados de recepção de dados.</td><td>5%</td></tr>
                <tr><td>6</td><td>Manutenção, atualização e adequação do banco de dados de publicação de dados.</td><td>5%</td></tr>
                <tr><td>7</td><td>Atualização dos formulários de supervisão ocupacional.</td><td>10%</td></tr>
                <tr><td>8</td><td>Atualização dos formulários de mobilização e seminários com foco nas áreas quilombolas.</td><td>10%</td></tr>
                <tr><td>9</td><td>Manutenção e atualização do website institucional.</td><td>10%</td></tr>
                <tr><td>10</td><td>Manutenção e atualização do portal de gestão de dados de coletas.</td><td>10%</td></tr>
                <tr><td>11</td><td>Manutenção e atualização do portal de controle administrativo.</td><td>10%</td></tr>
                <tr><td>12</td><td>Desenvolvimento de relatórios.</td><td>10%</td></tr>
                <tr><td>13</td><td>Desenvolvimento e publicação de repositório de arquivos e relatórios.</td><td>10%</td></tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Total proposto: 100%.</strong> As etapas 1 a 6 asseguram a operação contínua da
            infraestrutura e dos bancos de dados (recepção, publicação e coleta em campo). As etapas
            7 e 8 são centrais para o atendimento às áreas quilombolas: atualização dos formulários
            de supervisão ocupacional e dos formulários de mobilização e seminários. As etapas 9 a 11
            mantêm e atualizam o website institucional e os portais de gestão de dados e de controle
            administrativo já entregues. As etapas 12 e 13 agregam novos produtos ao sistema:
            desenvolvimento de relatórios e desenvolvimento e publicação do repositório de arquivos
            e relatórios, essenciais para a gestão, o monitoramento e a divulgação dos resultados do
            projeto. A execução dessas etapas é, portanto, fundamental para a continuidade e a
            evolução do PINOVARA em paralelo ao TED.
          </p>
        </section>

        <section className="parecer-tecnico__section">
          <h2>5. Aspectos técnicos relevantes</h2>
          <ul>
            <li>
              <strong>Stack:</strong> Backend em Node.js, Express e TypeScript; frontend em React,
              TypeScript e Vite; banco PostgreSQL; Prisma ORM; coleta em campo via ODK (ODK
              Collect / Aggregate).
            </li>
            <li>
              <strong>Segurança:</strong> Autenticação JWT, controle de acesso por roles e
              módulos, auditoria de ações críticas, política de privacidade e fluxos de consentimento
              quando aplicável.
            </li>
            <li>
              <strong>Operação:</strong> CI/CD com GitHub Actions, deploy com Docker, health
              checks da API, documentação técnica (API, arquitetura, deploy, procedimentos
              operacionais) no repositório do projeto.
            </li>
          </ul>
        </section>

        <section className="parecer-tecnico__section">
          <h2>6. Conclusão</h2>
          <p>
            Com base no acompanhamento técnico do projeto e na análise do sistema e da
            documentação entregues, atesta-se que os serviços objeto do Contrato (Instrumento
            106/2023) foram prestados em conformidade com o cronograma executado (100%), com
            entregas técnicas identificáveis para cada etapa. O sistema está em operação,
            permitindo coleta em campo, gestão de dados de organizações e famílias, qualificações e
            capacitações, e controle administrativo. A continuidade do serviço por meio de aditivo
            contratual, conforme etapas futuras descritas na seção 4, é técnica e operacionalmente
            coerente com a base já implantada e recomendada para garantia de continuidade e
            evolução do PINOVARA.
          </p>
        </section>

        <footer className="parecer-tecnico__footer">
          <p>
            Documento gerado a partir do sistema PINOVARA (rota /parecer). Para uso em
            complementação ao pleito de aditivo ao Contrato nº 2025013135.
          </p>
        </footer>
      </article>
    </div>
  );
}
