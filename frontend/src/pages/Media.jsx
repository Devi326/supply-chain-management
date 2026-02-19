import { useEffect, useState, useRef } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Media() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef();

    const load = async () => { setLoading(true); const r = await api.get('/media'); setItems(r.data.data); setLoading(false); };
    useEffect(() => { load(); }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        const fd = new FormData();
        fd.append('file', file);
        try {
            await api.post('/media/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('File uploaded!');
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
        finally { setUploading(false); fileRef.current.value = ''; }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this media?')) return;
        try { await api.delete(`/media/${id}`); toast.success('Deleted'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <Layout>
            <div className="page-header">
                <div><h1 className="page-title">Media Gallery</h1><p className="page-sub">{items.length} files</p></div>
                <label className={`btn btn-primary ${uploading ? 'disabled' : ''}`} style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
                    {uploading ? '⏳ Uploading…' : '📤 Upload Image'}
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            {loading ? <div className="spinner" /> : items.length === 0 ? (
                <div className="empty"><div className="empty-icon">🖼️</div><h3>No media yet</h3><p>Upload your first image to get started</p></div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {items.map(m => (
                        <div key={m.id} className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
                            <div style={{ aspectRatio: '1', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                <img
                                    src={`${API_BASE}/uploads/${m.file_name}`}
                                    alt={m.file_name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                />
                                <div style={{ display: 'none', fontSize: 40, alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>🖼️</div>
                            </div>
                            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{m.file_name}</span>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(m.id)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
}
