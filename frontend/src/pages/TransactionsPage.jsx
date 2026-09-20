import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const currency = (value) =>
  new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    currencyDisplay: 'symbol',
  }).format(value || 0);

const defaultForm = (date = new Date().toISOString().slice(0, 10)) => ({
  description: '',
  amount: '',
  type: 'expense',
  category: '',
  date,
});

const defaultFilters = {
  month: '',
  category: '',
  type: '',
};

function TransactionsPage() {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [filters, setFilters] = useState(defaultFilters);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async (activeFilters = filters) => {
    try {
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        api.get('/transaction', { params: activeFilters }),
        api.get('/category'),
      ]);

      setTransactions(transactionsResponse.data.transactions || transactionsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as transações.'));
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

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    const nextFilters = { ...filters, [name]: value };
    setFilters(nextFilters);
    fetchData(nextFilters);
  };

  const startEditing = (transaction) => {
    setEditingId(transaction.id);
    setForm({
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      type: transaction.type || (transaction.amount >= 0 ? 'income' : 'expense'),
      category: transaction.category,
      date: new Date(transaction.date).toISOString().slice(0, 10),
    });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(defaultForm());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        description: form.description,
        amount: Math.abs(Number(form.amount)),
        type: form.type,
        category: form.category,
        date: form.date,
      };

      if (editingId) {
        await api.put(`/transaction/${editingId}`, payload);
      } else {
        await api.post('/transaction', payload);
      }

      cancelEditing();
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a transação.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tens a certeza que queres eliminar esta transação?')) {
      return;
    }

    try {
      await api.delete(`/transaction/${id}`);
      await fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível eliminar a transação.'));
    }
  };

  if (loading) {
    return <div className="page-shell">{t('loading')} {t('transactions').toLowerCase()}...</div>;
  }

  return (
    <div className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">{t('finance')}</p>
          <h1>{t('transactions')}</h1>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <section className="card-panel filters-panel">
        <div className="filters-header">
          <h2>{t('filterTransactions')}</h2>
          <button type="button" className="link-button neutral" onClick={() => {
            setFilters(defaultFilters);
            fetchData(defaultFilters);
          }}>
            {t('clearFilters')}
          </button>
        </div>
        <div className="filters-grid">
          <div className="form-group">
            <label htmlFor="filter-month">{t('month')}</label>
            <input id="filter-month" name="month" type="month" value={filters.month} onChange={handleFilterChange} />
          </div>
          <div className="form-group">
            <label htmlFor="filter-category">{t('category')}</label>
            <select id="filter-category" name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">{t('allCategories')}</option>
              {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="filter-type">{t('type')}</label>
            <select id="filter-type" name="type" value={filters.type} onChange={handleFilterChange}>
              <option value="">{t('allTypes')}</option>
              <option value="income">{t('income')}</option>
              <option value="expense">{t('expense')}</option>
            </select>
          </div>
        </div>
      </section>

      <div className="cards-grid">
        <section className="card-panel">
          <h2>{editingId ? t('editTransaction') : t('addTransaction')}</h2>
          <form onSubmit={handleSubmit} className="stack-form">
            <div className="form-group">
              <label htmlFor="description">{t('description')}</label>
              <input
                id="description"
                name="description"
                type="text"
                value={form.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount">{t('amount')}</label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">{t('type')}</label>
              <select id="type" name="type" value={form.type} onChange={handleChange} required>
                <option value="expense">{t('expense')}</option>
                <option value="income">{t('income')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="category">{t('category')}</label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">{t('date')}</label>
              <input
                id="date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="primary-button">
              {editingId ? t('updateTransaction') : t('saveTransaction')}
            </button>
            {editingId && <button type="button" className="secondary-button" onClick={cancelEditing}>{t('cancel')}</button>}
          </form>
        </section>

        <section className="card-panel">
          <h2>{t('recentTransactions')}</h2>
          <ul className="simple-list">
            {transactions.length === 0 ? (
              <li>{t('noTransactions')}</li>
            ) : (
              transactions.map((item) => (
                <li key={item.id} className="list-item-row">
                  <div>
                    <strong>{item.description}</strong>
                    <small>
                      {item.category} · {new Date(item.date).toLocaleDateString()}
                    </small>
                  </div>
                  <div className="list-item-actions">
                    <span className={item.amount >= 0 ? 'positive' : 'negative'}>
                      {currency(item.amount)}
                    </span>
                    <div className="list-item-actions">
                      <button type="button" className="link-button neutral" onClick={() => startEditing(item)}>Edit</button>
                      <button type="button" className="link-button" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default TransactionsPage;
