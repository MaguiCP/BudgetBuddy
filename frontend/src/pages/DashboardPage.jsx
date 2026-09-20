import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const currency = (value) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
  }).format(value || 0);

function DashboardPage() {
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    byCategory: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [category, setCategory] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/transaction/summary', {
          params: { month, category: category || undefined },
        });

        setDashboard(response.data);
      } catch (error) {
        setError(getApiErrorMessage(error, 'Não foi possível carregar o dashboard.'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [month, category]);

  if (loading) {
    return <div className="page-shell">Loading dashboard...</div>;
  }

  return (
    <div className="page-shell dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>{t('dashboard')}</h1>
        </div>

        <div className="month-picker-wrap">
          <label htmlFor="month">{t('month')}</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
          <label htmlFor="dashboard-category">{t('category')}</label>
          <select id="dashboard-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">{t('allCategories')}</option>
            {dashboard.byCategory.map((item) => (
              <option key={item.category} value={item.category}>{item.category}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="stats-grid">
        <div className="stat-card income">
          <span>{t('totalIncome')}</span>
          <strong>{currency(dashboard.totalIncome)}</strong>
        </div>
        <div className="stat-card expense">
          <span>{t('totalExpenses')}</span>
          <strong>{currency(dashboard.totalExpenses)}</strong>
        </div>
        <div className="stat-card balance">
          <span>{t('balance')}</span>
          <strong>{currency(dashboard.balance)}</strong>
        </div>
      </div>

      <div className="dashboard-panels">
        <section className="panel">
          <h2>{t('byCategory')}</h2>
          <div className="category-chart" aria-label="Spending by category">
            {dashboard.byCategory.length === 0 ? (
              <p>{t('noData')}</p>
            ) : (
              dashboard.byCategory.map((item) => {
                const maxValue = Math.max(...dashboard.byCategory.map((entry) => Math.abs(entry.total)), 1);
                const width = `${Math.max((Math.abs(item.total) / maxValue) * 100, 4)}%`;

                return (
                  <div key={item.category} className="chart-row">
                    <div className="chart-label">
                      <span>{item.category}</span>
                      <strong>{currency(item.total)}</strong>
                    </div>
                    <div className="chart-track">
                      <span className={item.total >= 0 ? 'chart-bar income-bar' : 'chart-bar expense-bar'} style={{ width }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="panel">
          <h2>{t('recentTransactions')}</h2>
          <ul className="list">
            {dashboard.recentTransactions.length === 0 ? (
              <li>{t('noTransactions')}</li>
            ) : (
              dashboard.recentTransactions.map((item) => (
                <li key={item.id} className="list-row">
                  <div>
                    <strong>{item.description}</strong>
                    <small>{item.category}</small>
                  </div>
                  <span className={item.amount >= 0 ? 'positive' : 'negative'}>
                    {currency(item.amount)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
