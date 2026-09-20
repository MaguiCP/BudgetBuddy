import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const currency = (value) => new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  currencyDisplay: 'symbol',
}).format(value || 0);

const currentMonth = new Date().toISOString().slice(0, 7);
const defaultForm = () => ({ month: currentMonth, category: '', amount: '' });

function BudgetsPage() {
  const { t } = useLanguage();
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [spending, setSpending] = useState({});
  const [form, setForm] = useState(defaultForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async (month = form.month) => {
    try {
      const [budgetsResponse, categoriesResponse, summaryResponse] = await Promise.all([
        api.get('/budget', { params: { month } }),
        api.get('/category'),
        api.get('/transaction/summary', { params: { month } }),
      ]);

      setBudgets(budgetsResponse.data || []);
      setCategories(categoriesResponse.data || []);
      setSpending(
        (summaryResponse.data.byCategory || []).reduce((result, item) => {
          result[item.category.toLowerCase()] = Math.abs(item.total);
          return result;
        }, {})
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os orçamentos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editingId) {
        await api.put(`/budget/${editingId}`, payload);
      } else {
        await api.post('/budget', payload);
      }

      setEditingId(null);
      setForm(defaultForm());
      await fetchData(payload.month);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar o orçamento.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tens a certeza que queres eliminar este orçamento?')) {
      return;
    }

    try {
      await api.delete(`/budget/${id}`);
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível eliminar o orçamento.'));
    }
  };

  if (loading) {
    return <div className="page-shell">{t('loading')} {t('budgets').toLowerCase()}...</div>;
  }

  return (
    <div className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">{t('planning')}</p>
          <h1>{t('monthlyBudgets')}</h1>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid">
        <section className="card-panel">
          <h2>{editingId ? t('editBudget') : t('setBudget')}</h2>
          <form onSubmit={handleSubmit} className="stack-form">
            <div className="form-group">
              <label htmlFor="budget-month">{t('month')}</label>
              <input id="budget-month" name="month" type="month" value={form.month} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="budget-category">{t('category')}</label>
              <select id="budget-category" name="category" value={form.category} onChange={handleChange} required>
                <option value="">Select a category</option>
                {categories.filter((category) => category.type === 'expense').map((category) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="budget-amount">{t('limit')}</label>
              <input id="budget-amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required />
            </div>
            <button type="submit" className="primary-button">{editingId ? t('updateBudget') : t('saveBudget')}</button>
            {editingId && <button type="button" className="secondary-button" onClick={() => { setEditingId(null); setForm(defaultForm()); }}>{t('cancel')}</button>}
          </form>
        </section>

        <section className="card-panel">
          <h2>{form.month} budgets</h2>
          <ul className="simple-list">
            {budgets.length === 0 ? <li>{t('noBudgets')}</li> : budgets.map((budget) => {
              const spent = spending[budget.category.toLowerCase()] || 0;
              const percentageUsed = (spent / budget.amount) * 100;
              const percentage = Math.min(percentageUsed, 100);
              const exceeded = spent > budget.amount;
              const warning = !exceeded && percentageUsed >= 80;

              return (
                <li key={budget.id} className="budget-item">
                  <div className="list-item-row">
                    <div>
                      <strong>{budget.category}</strong>
                      <small>{currency(spent)} of {currency(budget.amount)}</small>
                      {exceeded && <span className="budget-alert danger">{t('budgetExceeded')}</span>}
                      {warning && <span className="budget-alert warning">{t('budgetUsed')}</span>}
                    </div>
                    <div className="list-item-actions">
                      <button type="button" className="link-button neutral" onClick={() => { setEditingId(budget.id); setForm({ month: budget.month, category: budget.category, amount: budget.amount }); }}>Edit</button>
                      <button type="button" className="link-button" onClick={() => handleDelete(budget.id)}>Delete</button>
                    </div>
                  </div>
                  <div className="chart-track"><span className={`chart-bar ${exceeded ? 'expense-bar' : warning ? 'warning-bar' : 'income-bar'}`} style={{ width: `${Math.max(percentage, 3)}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default BudgetsPage;
