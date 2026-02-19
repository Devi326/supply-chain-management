import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Users() {
    const { user: me } = useAuth();
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ name: '', username: '', password: '', user_level: '3', status: '1' });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        const [u, g] = await Promise.all([api.get('/users'), api.get('/groups')]);
        setUsers(u.data.data); setGroups(g.data.data); setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const openAdd = () => { setForm({ name: '', username: '', password: '', user_level: '3', status: '1' }); setEditId(null); setModal('add'); };
    const openEdit = (u) => { setForm({ name: u.name, username: u.username, password: '', user_level: String(u.user_level), status: String(u.status) }); setEditId(u.id); setModal('edit'); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            const payload = { ...form };
            if (modal === 'edit' && !payload.password) delete payload.password;
            modal === 'add' ? await api.post('/users', payload) : await api.put(`/users/${editId}`, payload);
            toast.success(modal === 'add' ? 'User added!' : 'User updated!');
            setModal(null); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try { await api.delete(`/users/${id}`); toast.success('Deleted'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <Layout>
            <div className="page-header">
                <div><h1 className="page-title">Users</h1><p className="page-sub">{users.length} accounts</p></div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
            </div>

            {loading ? <div className="spinner" /> : (
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>#</th><th>Name</th><th>Username</th><th>Group</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{u.name} {u.id === me?.id && <span className="badge badge-primary ml-1">You</span>}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{u.username}</td>
                                    <td><span className="badge badge-primary">{u.group_name}</span></td>
                                    <td><span className={`badge ${u.status == 1 ? 'badge-success' : 'badge-danger'}`}>{u.status == 1 ? 'Active' : 'Inactive'}</span></td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)}>✏️ Edit</button>
                                            {u.id !== me?.id && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>🗑️</button>}
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
                            <h3 className="modal-title">{modal === 'add' ? 'Add User' : 'Edit User'}</h3>
                            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group"><label className="form-label">Full Name *</label>
                                <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group"><label className="form-label">Username *</label>
                                    <input className="form-control" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required /></div>
                                <div className="form-group"><label className="form-label">Password {modal === 'edit' && '(leave blank to keep)'}</label>
                                    <input type="password" className="form-control" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required={modal === 'add'} /></div>
                                <div className="form-group"><label className="form-label">Group</label>
                                    <select className="form-control" value={form.user_level} onChange={e => setForm(f => ({ ...f, user_level: e.target.value }))}>
                                        {groups.map(g => <option key={g.id} value={g.group_level}>{g.group_name}</option>)}
                                    </select></div>
                                <div className="form-group"><label className="form-label">Status</label>
                                    <select className="form-control" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                        <option value="1">Active</option><option value="0">Inactive</option>
                                    </select></div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
