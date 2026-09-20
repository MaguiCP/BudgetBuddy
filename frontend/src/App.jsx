import { useState } from 'react';
import { BrowserRouter as Router, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetsPage from './pages/BudgetsPage';
import SavingsGoalsPage from './pages/SavingsGoalsPage';
import RecurringTransactionsPage from './pages/RecurringTransactionsPage';
import AccountPage from './pages/AccountPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import './styles/global.css';
import './styles/dashboard.css';

function AppLayout() {
  const { token, setToken } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navigation = [
    { to: '/dashboard', label: t('overview') },
    { to: '/transactions', label: t('transactions') },
    { to: '/budgets', label: t('budgets') },
    { to: '/goals', label: t('savingsGoals') },
    { to: '/recurring', label: t('recurring') },
    { to: '/categories', label: t('categories') },
  ];

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className={`app-shell ${token ? 'account-shell' : 'public-shell'}`}>
        {token ? (
          <aside className="sidebar">
            <div className="brand-lockup">
              <div className="brand-mark">B</div>
              <div>
                <div className="brand">BudgetBuddy</div>
                <span>{t('brandTagline')}</span>
              </div>
            </div>

            <NavLink to="/account" className="account-intro">
              <span className="account-avatar">♡</span>
              <div>
                <strong>{t('account')}</strong>
                <small>{t('personalFinances')}</small>
              </div>
            </NavLink>

            <div className="language-picker">
              <span>{t('language')}</span>
              <button type="button" className={language === 'pt' ? 'selected' : ''} onClick={() => setLanguage('pt')} aria-label="Português"><img src="https://flagcdn.com/w20/pt.png" alt="" />PT</button>
              <button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')} aria-label="English"><img src="https://flagcdn.com/w20/gb.png" alt="" />EN</button>
            </div>

            <nav className="side-nav" aria-label="Account navigation">
              <span className="nav-label">{t('workspace')}</span>
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileNavOpen(false)}
                  className={({ isActive }) => `side-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-dot" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="sidebar-footer">
              <p>{t('smallSteps')}</p>
              <button type="button" className="logout-btn" onClick={() => setToken('')}>
                {t('logout')}
              </button>
            </div>
          </aside>
        ) : (
          <header className="public-header">
            <div className="brand-lockup">
              <div className="brand-mark">B</div>
              <div>
                <div className="brand">BudgetBuddy</div>
                <span>{t('brandTagline')}</span>
              </div>
            </div>
            <nav className="public-nav">
              <NavLink to="/login">{t('login')}</NavLink>
              <NavLink to="/register" className="public-nav-primary">{t('createAccount')}</NavLink>
              <div className="language-picker public-language-picker">
                <button type="button" className={language === 'pt' ? 'selected' : ''} onClick={() => setLanguage('pt')} aria-label="Português"><img src="https://flagcdn.com/w20/pt.png" alt="" />PT</button>
                <button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')} aria-label="English"><img src="https://flagcdn.com/w20/gb.png" alt="" />EN</button>
              </div>
            </nav>
          </header>
        )}

        <main className="main-content">
          {token && (
            <>
              <div className="mobile-account-bar">
                <NavLink to="/account" className="mobile-account-link">{t('account')}</NavLink>
                <button type="button" className="mobile-menu-button" onClick={() => setMobileNavOpen((open) => !open)} aria-expanded={mobileNavOpen}>
                  {mobileNavOpen ? t('close') : t('menu')}
                </button>
              </div>
              {mobileNavOpen && (
                <nav className="mobile-nav" aria-label="Mobile account navigation">
                  {navigation.map((item) => (
                    <NavLink key={item.to} to={item.to} onClick={() => setMobileNavOpen(false)}>{item.label}</NavLink>
                  ))}
                  <div className="language-picker">
                    <span>{t('language')}</span>
                    <button type="button" className={language === 'pt' ? 'selected' : ''} onClick={() => setLanguage('pt')} aria-label="Português"><img src="https://flagcdn.com/w20/pt.png" alt="" />PT</button>
                    <button type="button" className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')} aria-label="English"><img src="https://flagcdn.com/w20/gb.png" alt="" />EN</button>
                  </div>
                  <button type="button" onClick={() => setToken('')}>{t('logout')}</button>
                </nav>
              )}
            </>
          )}
          <Routes>
          <Route path="/" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <PrivateRoute>
                <TransactionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <CategoriesPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <PrivateRoute>
                <BudgetsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <SavingsGoalsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/recurring"
            element={
              <PrivateRoute>
                <RecurringTransactionsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
          />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;