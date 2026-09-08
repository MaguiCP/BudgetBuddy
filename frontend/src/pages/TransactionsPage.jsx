import React, { useEffect, useState } from 'react';
import api from '../services/api';

const currency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value || 0);

const defaultForm = (date = new Date().toISOString().slice(0, 10)) => ({
  description: '',
  amount: '',
  category: '',
  date,
});

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [transactionsResponse, categoriesResponse] = await Promise.all([
        api.get('/transaction'),
        api.get('/category'),
      ]);

      setTransactions(transactionsResponse.data.transactions || transactionsResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load transactions.');
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
      await api.post('/transaction', {
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
      });

      setForm(defaultForm());
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create transaction.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transaction/${id}`);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete transaction.');
    }
  };

  if (loading) {
    return <div className="page-shell">Loading transactions...</div>;
  }

  return (
    <div className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Finance</p>
          <h1>Transactions</h1>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid">
        <section className="card-panel">
          <h2>Add transaction</h2>
          <form onSubmit={handleSubmit} className="stack-form">
            <div className="form-group">
              <label htmlFor="description">Description</label>
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
              <label htmlFor="amount">Amount</label>
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
              <label htmlFor="category">Category</label>
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
              <label htmlFor="date">Date</label>
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
              Save transaction
            </button>
          </form>
        </section>

        <section className="card-panel">
          <h2>Recent transactions</h2>
          <ul className="simple-list">
            {transactions.length === 0 ? (
              <li>No transactions yet.</li>
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
                    <button type="button" className="link-button" onClick={() => handleDelete(item.id)}>
                      Delete
                    </button>
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
