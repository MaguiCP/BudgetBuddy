import React, { useEffect, useState } from 'react';
import api from '../services/api';

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);

function DashboardPage() {
  const [dashboard, setDashboard] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    byCategory: [],
    recentTransactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/transaction/summary', {
          params: { month },
        });

        setDashboard(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [month]);

  if (loading) {
    return <div className="page-shell">Loading dashboard...</div>;
  }

  return (
    <div className="page-shell dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Budget dashboard</h1>
        </div>

        <div className="month-picker-wrap">
          <label htmlFor="month">Month</label>
          <input
            id="month"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card income">
          <span>Total income</span>
          <strong>{currency(dashboard.totalIncome)}</strong>
        </div>
        <div className="stat-card expense">
          <span>Total expenses</span>
          <strong>{currency(dashboard.totalExpenses)}</strong>
        </div>
        <div className="stat-card balance">
          <span>Balance</span>
          <strong>{currency(dashboard.balance)}</strong>
        </div>
      </div>

      <div className="dashboard-panels">
        <section className="panel">
          <h2>By category</h2>
          <ul className="list">
            {dashboard.byCategory.length === 0 ? (
              <li>No data yet.</li>
            ) : (
              dashboard.byCategory.map((item) => (
                <li key={item.category} className="list-row">
                  <span>{item.category}</span>
                  <strong>{currency(item.total)}</strong>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="panel">
          <h2>Recent transactions</h2>
          <ul className="list">
            {dashboard.recentTransactions.length === 0 ? (
              <li>No transactions yet.</li>
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
