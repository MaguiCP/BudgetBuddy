import { useEffect, useState } from 'react';
import api, { getApiErrorMessage } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const defaultForm = () => ({
  name: '',
  type: 'expense',
});

function CategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/category');
      setCategories(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as categorias.'));
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (category) => {
    setEditingId(category.id);
    setForm({ name: category.name, type: category.type });
    setError('');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm(defaultForm());
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const payload = {
        name: form.name,
        type: form.type,
      };

      if (editingId) {
        await api.put(`/category/${editingId}`, payload);
      } else {
        await api.post('/category', payload);
      }

      cancelEditing();
      await fetchCategories();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível guardar a categoria.'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tens a certeza que queres eliminar esta categoria?')) {
      return;
    }

    try {
      await api.delete(`/category/${id}`);
      await fetchCategories();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível eliminar a categoria.'));
    }
  };

  if (loading) {
    return <div className="page-shell">{t('loading')} {t('categories').toLowerCase()}...</div>;
  }

  return (
    <div className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">{t('setup')}</p>
          <h1>{t('categories')}</h1>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid">
        <section className="card-panel">
          <h2>{editingId ? t('editCategory') : t('createCategory')}</h2>
          <form onSubmit={handleSubmit} className="stack-form">
            <div className="form-group">
              <label htmlFor="name">{t('username')}</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">{t('type')}</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                <option value="expense">{t('expense')}</option>
                <option value="income">{t('income')}</option>
              </select>
            </div>

            <button type="submit" className="primary-button">
              {editingId ? t('updateCategory') : t('saveCategory')}
            </button>
            {editingId && <button type="button" className="secondary-button" onClick={cancelEditing}>{t('cancel')}</button>}
          </form>
        </section>

        <section className="card-panel">
          <h2>{t('allCategoriesTitle')}</h2>
          <ul className="simple-list">
            {categories.length === 0 ? (
              <li>{t('noCategories')}</li>
            ) : (
              categories.map((category) => (
                <li key={category.id} className="list-item-row">
                  <div>
                    <strong>{category.name}</strong>
                    <small>{category.type}</small>
                  </div>
                  <div className="list-item-actions">
                    <button type="button" className="link-button neutral" onClick={() => startEditing(category)}>Edit</button>
                    <button type="button" className="link-button" onClick={() => handleDelete(category.id)}>Delete</button>
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

export default CategoriesPage;
