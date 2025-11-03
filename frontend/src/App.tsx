import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute, PublicRoute } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import SystemInfo from './pages/admin/SystemInfo';
import SystemSettings from './pages/admin/SystemSettings';
import AuditLogs from './pages/admin/AuditLogs';
import UserManagement from './pages/admin/UserManagement';
import RoleManagement from './pages/admin/RoleManagement';
import BackupManager from './pages/admin/BackupManager';
import SystemMonitor from './pages/admin/SystemMonitor';
import AnalyticsPanel from './pages/admin/AnalyticsPanel';
import SyncODKGeral from './pages/admin/SyncODKGeral';

// Module Pages
import OrganizacoesModule from './pages/modules/OrganizacoesModule';
import PerfilModule from './pages/modules/PerfilModule';
import RepositorioPublico from './pages/RepositorioPublico';

// 🚧 Imports dos módulos em desenvolvimento - comentados
/*
import DiagnosticoModule from './pages/modules/DiagnosticoModule';
import AssociadosModule from './pages/modules/AssociadosModule';
import RelatoriosModule from './pages/modules/RelatoriosModule';
import MapasModule from './pages/modules/MapasModule';
import PesquisaModule from './pages/modules/PesquisaModule';
import TecnicosModule from './pages/modules/TecnicosModule';
import MobilizacaoModule from './pages/modules/MobilizacaoModule';
*/
import TestPermissions from './pages/TestPermissions';
import AccessDenied from './pages/AccessDenied';
import ConfiguracaoODK from './pages/ConfiguracaoODK';
import FormularioEnketo from './pages/FormularioEnketo';
import PoliticaPrivacidade from './pages/PoliticaPrivacidade';
import AvisoCookies from './components/AvisoCookies';
import GoogleAnalytics from './components/GoogleAnalytics';
import { usePageTitle } from './hooks/usePageTitle';
import './App.css';

function AppRoutes() {
  // Atualiza o título da página automaticamente baseado na rota
  usePageTitle();
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
      <Route path="/repositorio" element={<RepositorioPublico />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/pinovara"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Module Routes */}
      <Route
        path="/perfil/*"
        element={
          <ProtectedRoute>
            <PerfilModule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/organizacoes/*"
        element={
          <ProtectedRoute>
            <OrganizacoesModule />
          </ProtectedRoute>
        }
      />

      {/* 🚧 ROTAS DOS MÓDULOS EM DESENVOLVIMENTO - OCULTAS */}
      {/*
      <Route
        path="/diagnostico/*"
        element={
          <ProtectedRoute>
            <DiagnosticoModule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/associados/*"
        element={
          <ProtectedRoute>
            <AssociadosModule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/relatorios/*"
        element={
          <ProtectedRoute>
            <RelatoriosModule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mapas/*"
        element={
          <ProtectedRoute>
            <MapasModule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/pesquisa/*"
        element={
          <ProtectedRoute>
            <PesquisaModule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tecnicos/*"
        element={
          <ProtectedRoute>
            <TecnicosModule />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mobilizacao/*"
        element={
          <ProtectedRoute>
            <MobilizacaoModule />
          </ProtectedRoute>
        }
      />
      */}

      <Route
        path="/configuracao-odk"
        element={
          <ProtectedRoute>
            <ConfiguracaoODK />
          </ProtectedRoute>
        }
      />

      <Route
        path="/formulario-enketo"
        element={
          <ProtectedRoute>
            <FormularioEnketo />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="system-info" element={<SystemInfo />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="modules" element={<RoleManagement />} />
        <Route path="roles" element={<RoleManagement />} />
        <Route path="analytics" element={<AnalyticsPanel />} />
        <Route path="sync-odk" element={<SyncODKGeral />} />
        <Route path="test-permissions" element={<TestPermissions />} />
        <Route path="test-access-denied" element={<AccessDenied
          title="Teste de Acesso Negado"
          message="Esta é uma página de teste para verificar os estilos dos botões."
          showLoginButton={true}
          showDashboardButton={true}
          contactAdmin={true}
        />} />
        <Route path="backup" element={<BackupManager />} />
        <Route path="monitor" element={<SystemMonitor />} />
      </Route>

      {/* Redirecionar rotas não encontradas */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <GoogleAnalytics />
        <div className="App">
          <AppRoutes />
          <AvisoCookies />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
