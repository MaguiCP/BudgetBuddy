import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const defaultProfile = { username: '', email: '' };
const defaultPassword = { currentPassword: '', password: '', confirmPassword: '' };

function AccountPage() {
  const { setToken } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState(defaultProfile);
  const [passwordForm, setPasswordForm] = useState(defaultPassword);
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/user/me');
        setProfile({ username: response.data.user.username, email: response.data.user.email });
      } catch (err) {
        setError(getApiErrorMessage(err, 'Unable to load your account.'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setProfileMessage('');
    setSavingProfile(true);

    try {
      const response = await api.put('/user/me', profile);
      setToken(response.data.token);
      setProfileMessage(t('profileUpdated'));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update your account details.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setError('');
    setPasswordMessage('');

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setError(t('passwordsMismatch'));
      return;
    }

    setSavingPassword(true);
    try {
      const response = await api.put('/user/me', {
        ...profile,
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.password,
      });
      setToken(response.data.token);
      setPasswordForm(defaultPassword);
      setPasswordMessage(t('passwordUpdated'));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to change your password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="page-shell">{t('loadingAccount')}</div>;

  return (
    <div className="page-shell account-page">
      <div className="section-header">
        <div>
          <p className="eyebrow">{t('personalSpace')}</p>
          <h1>{t('account')}</h1>
          <p className="page-subtitle">{t('keepDetails')}</p>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid account-cards">
        <section className="card-panel">
          <h2>{t('personalDetails')}</h2>
          <form onSubmit={saveProfile} className="stack-form">
            <div className="form-group">
              <label htmlFor="account-username">{t('username')}</label>
              <input id="account-username" name="username" value={profile.username} onChange={handleProfileChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="account-email">{t('email')}</label>
              <input id="account-email" name="email" type="email" value={profile.email} onChange={handleProfileChange} required />
            </div>
            <button type="submit" className="primary-button" disabled={savingProfile}>
              {savingProfile ? t('saving') : t('saveDetails')}
            </button>
            {profileMessage && <p className="success-message">{profileMessage}</p>}
          </form>
        </section>

        <section className="card-panel">
          <h2>{t('changePassword')}</h2>
          <form onSubmit={changePassword} className="stack-form">
            <div className="form-group">
              <label htmlFor="current-password">{t('currentPassword')}</label>
              <input id="current-password" name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={handlePasswordChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="new-password">{t('newPassword')}</label>
              <input id="new-password" name="password" type="password" minLength="8" value={passwordForm.password} onChange={handlePasswordChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password">{t('confirmPassword')}</label>
              <input id="confirm-password" name="confirmPassword" type="password" minLength="8" value={passwordForm.confirmPassword} onChange={handlePasswordChange} required />
            </div>
            <button type="submit" className="primary-button" disabled={savingPassword}>
              {savingPassword ? t('updating') : t('updatePassword')}
            </button>
            {passwordMessage && <p className="success-message">{passwordMessage}</p>}
          </form>
        </section>
      </div>
    </div>
  );
}

export default AccountPage;
