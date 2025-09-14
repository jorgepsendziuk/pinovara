import { useState } from 'react';
import { PermissionGuard } from '../contexts/AuthContext';

function TestPermissions() {
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');

  const modules = [
    'dashboard', 'tecnicos', 'pesquisa', 'associados', 'mapas',
    'sistema', 'organizacoes', 'diagnostico', 'relatorios', 'mobilizacao'
  ];

  const roles = [
    'tecnico', 'pesquisa', 'associados', 'administracao', 'gestao', 'geoprocessamento'
  ];

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Teste de Permissões</h1>
          <p>Teste o sistema de controle de acesso baseado em tipos de usuário</p>
        </div>
      </div>

      <div className="permissions-test-section">
        <div className="test-controls">
          <div className="control-group">
            <label htmlFor="module-select">Selecionar Módulo:</label>
            <select
              id="module-select"
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="form-select"
            >
              <option value="">Selecione um módulo...</option>
              {modules.map(module => (
                <option key={module} value={module}>{module}</option>
              ))}
            </select>
          </div>

          <div className="control-group">
            <label htmlFor="role-select">Selecionar Tipo de Usuário:</label>
            <select
              id="role-select"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="form-select"
            >
              <option value="">Selecione um tipo...</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedModule && selectedRole && (
          <div className="test-result">
            <h3>Testando Acesso</h3>
            <p>
              Testando se um usuário do tipo <strong>"{selectedRole}"</strong> pode acessar
              o módulo <strong>"{selectedModule}"</strong>
            </p>

            <PermissionGuard
              module={selectedModule}
              role={selectedRole}
              fallback={
                <div className="test-denied">
                  <div className="denied-icon">❌</div>
                  <h4>Acesso Negado</h4>
                  <p>O tipo de usuário "{selectedRole}" não tem permissão para acessar "{selectedModule}"</p>
                </div>
              }
            >
              <div className="test-allowed">
                <div className="allowed-icon">✅</div>
                <h4>Acesso Permitido</h4>
                <p>O tipo de usuário "{selectedRole}" tem permissão para acessar "{selectedModule}"</p>
                <div className="module-preview">
                  <h5>Conteúdo do Módulo {selectedModule}</h5>
                  <p>Este é um conteúdo simulado do módulo {selectedModule}.</p>
                  <p>Em um sistema real, aqui seria exibido o conteúdo específico do módulo.</p>
                </div>
              </div>
            </PermissionGuard>
          </div>
        )}

        <div className="permissions-info">
          <h3>Informações sobre Permissões</h3>

          <div className="permissions-grid">
            <div className="permission-item">
              <h4>👷 TÉCNICO</h4>
              <p><strong>Acesso:</strong> técnicos</p>
              <small>Campo de trabalho especializado</small>
            </div>

            <div className="permission-item">
              <h4>🔬 PESQUISA</h4>
              <p><strong>Acesso:</strong> pesquisa, dashboard, diagnóstico, relatórios, mapas</p>
              <small>Visualização para pesquisadores</small>
            </div>

            <div className="permission-item">
              <h4>👥 ASSOCIADOS</h4>
              <p><strong>Acesso:</strong> associados</p>
              <small>Gestão de pessoas associadas</small>
            </div>

            <div className="permission-item">
              <h4>⚙️ ADMINISTRAÇÃO</h4>
              <p><strong>Acesso:</strong> TODOS os módulos</p>
              <small>Controle total do sistema</small>
            </div>

            <div className="permission-item">
              <h4>📊 GESTÃO</h4>
              <p><strong>Acesso:</strong> TODOS os módulos (visualização)</p>
              <small>Visão geral do sistema</small>
            </div>

            <div className="permission-item">
              <h4>🗺️ GEOPROCESSAMENTO</h4>
              <p><strong>Acesso:</strong> mapas (edição) + dashboard, diagnóstico, relatórios</p>
              <small>Especialista em dados geoespaciais</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestPermissions;
