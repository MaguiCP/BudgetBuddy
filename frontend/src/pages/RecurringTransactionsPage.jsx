import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';

const currency = (value) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(value || 0);
const defaultForm = () => ({ description: '', amount: '', type: 'expense', category: '', nextDate: new Date().toISOString().slice(0, 10) });

function RecurringTransactionsPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [recurringResponse, categoriesResponse] = await Promise.all([api.get('/recurring-transaction'), api.get('/category')]);
      setItems(recurringResponse.data || []);
      setCategories(categoriesResponse.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as transações recorrentes.'));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);
  const handleChange = (event) => { const { name, value } = event.target; setForm((current) => ({ ...current, [name]: value })); };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = { ...form, amount: Math.abs(Number(form.amount)), nextDate: form.nextDate };
    try {
      if (editingId) await api.put(`/recurring-transaction/${editingId}`, payload);
      else await api.post('/recurring-transaction', payload);
      setEditingId(null); setForm(defaultForm()); await fetchData();
    } catch (err) { setError(getApiErrorMessage(err, 'Não foi possível guardar a transação recorrente.')); }
  };

  const generate = async (id) => {
    try { await api.post(`/recurring-transaction/${id}/generate`); await fetchData(); }
    catch (err) { setError(getApiErrorMessage(err, 'Não foi possível gerar a transação.')); }
  };
  const remove = async (id) => {
    if (!window.confirm('Tens a certeza que queres eliminar esta transação recorrente?')) return;
    try { await api.delete(`/recurring-transaction/${id}`); await fetchData(); }
    catch (err) { setError(getApiErrorMessage(err, 'Não foi possível eliminar a transação recorrente.')); }
  };

  if (loading) return <div className="page-shell">Loading recurring transactions...</div>;
  return (
    <div className="page-shell">
      <div className="section-header"><div><p className="eyebrow">Automation</p><h1>Recurring transactions</h1></div></div>
      {error && <p className="error-message">{error}</p>}
      <div className="cards-grid">
        <section className="card-panel">
          <h2>{editingId ? 'Edit recurring transaction' : 'Create recurring transaction'}</h2>
          <form onSubmit={handleSubmit} className="stack-form">
            <div className="form-group"><label htmlFor="recurring-description">Description</label><input id="recurring-description" name="description" value={form.description} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="recurring-amount">Amount</label><input id="recurring-amount" name="amount" type="number" min="0.01" step="0.01" value={form.amount} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="recurring-type">Type</label><select id="recurring-type" name="type" value={form.type} onChange={handleChange}><option value="expense">Expense</option><option value="income">Income</option></select></div>
            <div className="form-group"><label htmlFor="recurring-category">Category</label><select id="recurring-category" name="category" value={form.category} onChange={handleChange} required><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></div>
            <div className="form-group"><label htmlFor="recurring-date">Next date</label><input id="recurring-date" name="nextDate" type="date" value={form.nextDate} onChange={handleChange} required /></div>
            <button type="submit" className="primary-button">{editingId ? 'Update' : 'Save'}</button>
            {editingId && <button type="button" className="secondary-button" onClick={() => { setEditingId(null); setForm(defaultForm()); }}>Cancel</button>}
          </form>
        </section>
        <section className="card-panel"><h2>Scheduled transactions</h2><ul className="simple-list">{items.length === 0 ? <li>No recurring transactions yet.</li> : items.map((item) => <li key={item.id} className="list-item-row"><div><strong>{item.description}</strong><small>{item.category} · {currency(item.amount)} · next: {new Date(item.nextDate).toLocaleDateString('pt-PT')}</small></div><div className="list-item-actions"><button type="button" className="primary-button compact-button" onClick={() => generate(item.id)}>Generate now</button><button type="button" className="link-button neutral" onClick={() => { setEditingId(item.id); setForm({ description: item.description, amount: item.amount, type: item.type, category: item.category, nextDate: item.nextDate.slice(0, 10) }); }}>Edit</button><button type="button" className="link-button" onClick={() => remove(item.id)}>Delete</button></div></li>)}</ul></section>
      </div>
    </div>
  );
}

export default RecurringTransactionsPage;
