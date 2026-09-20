import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const currency = (value) => new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
}).format(value || 0);

const defaultForm = () => ({ name: '', targetAmount: '', currentAmount: '', deadline: '' });

function SavingsGoalsPage() {
  const { t } = useLanguage();
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchGoals = async () => {
    try {
      const response = await api.get('/savings-goal');
      setGoals(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar os objetivos.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoals(); }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      ...form,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount || 0),
      deadline: form.deadline || null,
    };

    try {
      if (editingId) await api.put(`/savings-goal/${editingId}`, payload);
      else await api.post('/savings-goal', payload);
      setEditingId(null);
      setForm(defaultForm());
      await fetchGoals();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar o objetivo.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tens a certeza que queres eliminar este objetivo?')) return;
    try {
      await api.delete(`/savings-goal/${id}`);
      await fetchGoals();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível eliminar o objetivo.'));
    }
  };

  if (loading) return <div className="page-shell">{t('loading')} {t('savingsGoals').toLowerCase()}...</div>;

  return (
    <div className="page-shell">
      <div className="section-header">
        <div><p className="eyebrow">{t('planning')}</p><h1>{t('savingsPlanning')}</h1></div>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="cards-grid">
        <section className="card-panel">
          <h2>{editingId ? t('editGoal') : t('createGoal')}</h2>
          <form onSubmit={handleSubmit} className="stack-form">
            <div className="form-group"><label htmlFor="goal-name">{t('description')}</label><input id="goal-name" name="name" value={form.name} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="goal-target">{t('targetAmount')}</label><input id="goal-target" name="targetAmount" type="number" min="0.01" step="0.01" value={form.targetAmount} onChange={handleChange} required /></div>
            <div className="form-group"><label htmlFor="goal-current">{t('alreadySaved')}</label><input id="goal-current" name="currentAmount" type="number" min="0" step="0.01" value={form.currentAmount} onChange={handleChange} /></div>
            <div className="form-group"><label htmlFor="goal-deadline">{t('deadline')}</label><input id="goal-deadline" name="deadline" type="date" value={form.deadline} onChange={handleChange} /></div>
            <button type="submit" className="primary-button">{editingId ? t('updateGoal') : t('saveGoal')}</button>
            {editingId && <button type="button" className="secondary-button" onClick={() => { setEditingId(null); setForm(defaultForm()); }}>{t('cancel')}</button>}
          </form>
        </section>
        <section className="card-panel">
          <h2>{t('savingsGoals')}</h2>
          <ul className="simple-list">
            {goals.length === 0 ? <li>{t('noGoals')}</li> : goals.map((goal) => {
              const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              const completed = goal.currentAmount >= goal.targetAmount;
              return (
                <li key={goal.id} className="budget-item">
                  <div className="list-item-row">
                    <div><strong>{goal.name}</strong><small>{currency(goal.currentAmount)} of {currency(goal.targetAmount)}{goal.deadline ? ` · ${new Date(goal.deadline).toLocaleDateString('pt-PT')}` : ''}</small></div>
                    <div className="list-item-actions"><button type="button" className="link-button neutral" onClick={() => { setEditingId(goal.id); setForm({ name: goal.name, targetAmount: goal.targetAmount, currentAmount: goal.currentAmount, deadline: goal.deadline ? goal.deadline.slice(0, 10) : '' }); }}>Edit</button><button type="button" className="link-button" onClick={() => handleDelete(goal.id)}>Delete</button></div>
                  </div>
                  <div className="chart-track"><span className={`chart-bar ${completed ? 'income-bar' : 'warning-bar'}`} style={{ width: `${Math.max(percentage, 3)}%` }} /></div>
                  <small className={completed ? 'positive' : ''}>{completed ? t('goalCompleted') : `${Math.round(percentage)}%`}</small>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}

export default SavingsGoalsPage;
