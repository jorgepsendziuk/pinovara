import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileErrors {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

function Profile() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<ProfileErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const validateProfileForm = (): boolean => {
    const newErrors: ProfileErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (profileData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!profileData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    const newErrors: ProfileErrors = {};

    if (!profileData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }

    if (!profileData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (profileData.newPassword.length < 8) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(profileData.newPassword)) {
      newErrors.newPassword = 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número';
    }

    if (!profileData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (profileData.newPassword !== profileData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name.trim(),
          email: profileData.email.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao atualizar perfil');
      }

      setSuccess('Perfil atualizado com sucesso!');
      await refreshUser();

      // Limpar campos de senha
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Erro ao atualizar perfil'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao alterar senha');
      }

      setSuccess('Senha alterada com sucesso!');
      setActiveTab('profile');

      // Limpar campos de senha
      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Erro ao alterar senha'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));

    // Limpar erro do campo específico
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Limpar erro geral
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }

    // Limpar sucesso
    if (success) {
      setSuccess(null);
    }
  };

  if (!user) {
    return (
      <div className="profile-content">
        <div className="loading-state">
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-content">
      <div className="page-header">
        <div className="header-content">
          <h1>Meu Perfil</h1>
          <p>Gerencie suas informações pessoais e configurações de conta</p>
        </div>
      </div>

      {errors.general && (
        <div className="alert alert-error">
          <p>{errors.general}</p>
          <button onClick={() => setErrors({})} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <p>{success}</p>
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      {/* Profile Avatar Section */}
      <div className="profile-avatar-section">
        <div className="profile-avatar">
          <div className="avatar-circle">
            <span className="avatar-text">
              {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </span>
          </div>
          <div className="avatar-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>
            <span className="user-role-badge">
              {user.roles?.[0]?.name || 'Usuário'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Tabs */}
      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Informações Pessoais
        </button>
        <button
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          Alterar Senha
        </button>
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="profile-form">
          <div className="form-section">
            <h3>Informações Básicas</h3>

            <div className="form-group">
              <label htmlFor="name">Nome Completo</label>
              <input
                type="text"
                id="name"
                value={profileData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Digite seu nome completo"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={profileData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="Digite seu email"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-info">
              <p><strong>Último acesso:</strong> Agora</p>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/pinovara')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordUpdate} className="profile-form">
          <div className="form-section">
            <h3>Alterar Senha</h3>
            <p className="form-description">
              Para sua segurança, escolha uma senha forte com pelo menos 8 caracteres,
              contendo letras maiúsculas, minúsculas e números.
            </p>

            <div className="form-group">
              <label htmlFor="currentPassword">Senha Atual</label>
              <div className="password-input-group">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={profileData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                  placeholder="Digite sua senha atual"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Nova Senha</label>
              <div className="password-input-group">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={profileData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className={`form-input ${errors.newPassword ? 'error' : ''}`}
                  placeholder="Digite sua nova senha"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar Nova Senha</label>
              <div className="password-input-group">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={profileData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  placeholder="Confirme sua nova senha"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;
