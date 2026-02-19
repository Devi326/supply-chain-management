import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'add' | 'edit'
    const [deleting, setDeleting] = useState(null);
    const [form, setForm] = useState({ name: '', quantity: '', buy_price: '', sale_price: '', categorie_id: '', media_id: '' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        const [p, c] = await Promise.all([api.get('/products'), api.get('/categories')]);
        setProducts(p.data.data);
        setCategories(c.data.data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => {
        setForm({ name: '', quantity: '', buy_price: '', sale_price: '', categorie_id: categories[0]?.id || '', media_id: '' });
        setEditId(null); setModal('add');
    };
    const openEdit = (p) => {
        setForm({ name: p.name, quantity: p.quantity, buy_price: p.buy_price, sale_price: p.sale_price, categorie_id: p.categorie_id || '', media_id: p.media_id || '' });
        setEditId(p.id); setModal('edit');
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (modal === 'add') {
                await api.post('/products', form);
                toast.success('Product added!');
            } else {
                await api.put(`/products/${editId}`, form);
                toast.success('Product updated!');
            }
            setModal(null); load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error saving product');
        } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Products</h1>
                    <p className="page-sub">{products.length} total EV parts & products</p>
                </div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
                <div className="search-bar">
                    <span>🔍</span>
                    <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? <div className="spinner" /> : (
                <div className="table-wrap" style={{ borderRadius: 'var(--radius)' }}>
                    <table>
                        <thead>
                            <tr><th>#</th><th>Name</th><th>Category</th><th>Qty</th><th>Buy Price</th><th>Sale Price</th><th>Date</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No products found</td></tr>
                            ) : filtered.map((p, i) => (
                                <tr key={p.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                                    <td><span className="badge badge-primary">{p.category}</span></td>
                                    <td>
                                        <span className={`badge ${parseInt(p.quantity) > 0 ? 'badge-success' : 'badge-danger'}`}>
                                            {p.quantity}
                                        </span>
                                    </td>
                                    <td>₹{parseFloat(p.buy_price).toLocaleString('en-IN')}</td>
                                    <td>₹{parseFloat(p.sale_price).toLocaleString('en-IN')}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.date?.split('T')[0]}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>✏️ Edit</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>🗑️</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <div className="modal-backdrop" onClick={() => setModal(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h3>
                            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product Name *</label>
                                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Quantity</label>
                                    <input type="number" className="form-control" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <select className="form-control" value={form.categorie_id} onChange={e => setForm(f => ({ ...f, categorie_id: e.target.value }))} required>
                                        <option value="">Select…</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Buy Price (₹) *</label>
                                    <input type="number" step="0.01" className="form-control" value={form.buy_price} onChange={e => setForm(f => ({ ...f, buy_price: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Sale Price (₹) *</label>
                                    <input type="number" step="0.01" className="form-control" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? '+ Add Product' : '💾 Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
