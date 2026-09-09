import { useEffect, useState } from 'react';
import api from '../services/api';

const defaultForm = () => ({
  name: '',
  type: 'expense',
});

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(defaultForm());
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/category');
      setCategories(response.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
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
      await api.post('/category', {
        name: form.name,
        type: form.type,
      });

      setForm(defaultForm());
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to create category.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/category/${id}`);
      await fetchCategories();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete category.');
    }
  };

  if (loading) {
    return <div className="page-shell">Loading categories...</div>;
  }

  return (
    <div className="page-shell">
      <div className="section-header">
        <div>
          <p className="eyebrow">Setup</p>
          <h1>Categories</h1>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}

      <div className="cards-grid">
        <section className="card-panel">
          <h2>Create category</h2>
          <form onSubmit={handleSubmit} className="stack-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
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
              <label htmlFor="type">Type</label>
              <select id="type" name="type" value={form.type} onChange={handleChange}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <button type="submit" className="primary-button">
              Save category
            </button>
          </form>
        </section>

        <section className="card-panel">
          <h2>All categories</h2>
          <ul className="simple-list">
            {categories.length === 0 ? (
              <li>No categories yet.</li>
            ) : (
              categories.map((category) => (
                <li key={category.id} className="list-item-row">
                  <div>
                    <strong>{category.name}</strong>
                    <small>{category.type}</small>
                  </div>
                  <button type="button" className="link-button" onClick={() => handleDelete(category.id)}>
                    Delete
                  </button>
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
