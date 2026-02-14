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

  /** Valida senha só quando o usuário preencheu algum campo de senha */
  const validatePasswordIfFilled = (): boolean => {
    const anyFilled = !!(profileData.currentPassword || profileData.newPassword || profileData.confirmPassword);
    if (!anyFilled) return true;

    const newErrors: ProfileErrors = {};
    if (!profileData.currentPassword) newErrors.currentPassword = 'Senha atual é obrigatória';
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
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!validateProfileForm()) return;
    if (!validatePasswordIfFilled()) return;

    setLoading(true);
    setSuccess(null);
    const token = localStorage.getItem('token');
    const wantToChangePassword = !!(profileData.currentPassword || profileData.newPassword || profileData.confirmPassword);

    try {
      const profileRes = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name.trim(),
          email: profileData.email.trim(),
        }),
      });
      const profileDataRes = await profileRes.json();
      if (!profileRes.ok) {
        throw new Error(profileDataRes.error?.message || 'Erro ao atualizar perfil');
      }
      await refreshUser();

      if (wantToChangePassword) {
        const pwdRes = await fetch(`${API_BASE}/auth/change-password`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: profileData.currentPassword,
            newPassword: profileData.newPassword,
          }),
        });
        const pwdData = await pwdRes.json();
        if (!pwdRes.ok) {
          throw new Error(pwdData.error?.message || 'Erro ao alterar senha');
        }
        setSuccess('Perfil e senha atualizados com sucesso!');
      } else {
        setSuccess('Perfil atualizado com sucesso!');
      }

      setProfileData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Erro ao salvar:', error);
      setErrors({
        general: error instanceof Error ? error.message : 'Erro ao salvar',
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
      {/* Cabeçalho compacto: nome, email e todos os papéis */}
      <div className="profile-header-compact">
        <div className="profile-header-title">
          <p>{user.name} · {user.email}</p>
        </div>
        <div className="profile-header-roles">
          {user.roles && user.roles.length > 0
            ? user.roles.map((role: { id: string; name: string }) => (
                <span key={role.id} className="user-role-badge">{role.name}</span>
              ))
            : <span className="user-role-badge">Usuário</span>
          }
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

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h3>Nome e email</h3>
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
        </div>

        <div className="form-section">
          <h3>Alterar senha</h3>
          <p className="form-description">
            Deixe em branco para não alterar. Senha forte: 8+ caracteres, maiúsculas, minúsculas e números.
          </p>
          <div className="form-group">
            <label htmlFor="currentPassword">Senha atual</label>
            <div className="password-input-group">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                id="currentPassword"
                value={profileData.currentPassword}
                onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                className={`form-input ${errors.currentPassword ? 'error' : ''}`}
                placeholder="Só preencha se for trocar a senha"
              />
              <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                {showCurrentPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.currentPassword && <span className="error-message">{errors.currentPassword}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">Nova senha</label>
            <div className="password-input-group">
              <input
                type={showNewPassword ? 'text' : 'password'}
                id="newPassword"
                value={profileData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`form-input ${errors.newPassword ? 'error' : ''}`}
                placeholder="Nova senha"
              />
              <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                {showNewPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.newPassword && <span className="error-message">{errors.newPassword}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar nova senha</label>
            <div className="password-input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={profileData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repita a nova senha"
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/pinovara')} className="btn btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Profile;
