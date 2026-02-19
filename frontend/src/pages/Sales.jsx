import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';

// Try to load contract info (may not exist until Hardhat deploys)
let CONTRACT_ADDRESS = null;
let CONTRACT_ABI = null;
try {
    const contractInfo = await import('../contracts/SupplyChain.json').catch(() => null);
    if (contractInfo) { CONTRACT_ADDRESS = contractInfo.address; CONTRACT_ABI = contractInfo.abi; }
} catch { }

export default function Sales() {
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ product_id: '', qty: '', price: '', date: new Date().toISOString().split('T')[0] });
    const [editId, setEditId] = useState(null);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        const [s, p] = await Promise.all([api.get('/sales'), api.get('/products')]);
        setSales(s.data.data);
        setProducts(p.data.data);
        setLoading(false);
    };
    useEffect(() => { load(); }, []);

    const selectedProduct = products.find(p => p.id == form.product_id);

    // Auto-fill price when product changes
    const handleProductChange = (e) => {
        const pid = e.target.value;
        const prod = products.find(p => p.id == pid);
        setForm(f => ({ ...f, product_id: pid, price: prod ? (parseFloat(prod.sale_price) * (parseInt(form.qty) || 1)).toFixed(2) : '' }));
    };

    const handleQtyChange = (e) => {
        const qty = e.target.value;
        const prod = products.find(p => p.id == form.product_id);
        setForm(f => ({ ...f, qty, price: prod ? (parseFloat(prod.sale_price) * (parseInt(qty) || 1)).toFixed(2) : f.price }));
    };

    const openAdd = () => {
        setForm({ product_id: '', qty: '1', price: '', date: new Date().toISOString().split('T')[0] });
        setEditId(null); setModal('add');
    };
    const openEdit = (s) => {
        setForm({ product_id: s.product_id, qty: s.qty, price: s.price, date: s.date });
        setEditId(s.id); setModal('edit');
    };

    const recordOnChain = async (saleId, productId, productName, qty, price) => {
        if (!CONTRACT_ADDRESS || !CONTRACT_ABI) return null;
        if (!window.ethereum) { toast('MetaMask not found; skipping on-chain record', { icon: '⚠️' }); return null; }
        try {
            const { ethers } = await import('ethers');
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send('eth_requestAccounts', []);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
            const priceWei = BigInt(Math.round(price * 100)); // store as paise
            const tx = await contract.recordSale(saleId, productId, productName, qty, priceWei);
            toast.loading('Waiting for blockchain confirmation...', { id: 'chain-tx' });
            await tx.wait();
            toast.success('Sale recorded on blockchain! ⛓️', { id: 'chain-tx' });
            return tx.hash;
        } catch (err) {
            toast.error('Blockchain record failed: ' + (err.reason || err.message), { id: 'chain-tx' });
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        try {
            if (modal === 'add') {
                const r = await api.post('/sales', form);
                const newId = r.data.id;
                const prod = products.find(p => p.id == form.product_id);
                const txHash = await recordOnChain(newId, parseInt(form.product_id), prod?.name || '', parseInt(form.qty), parseFloat(form.price));
                if (txHash) await api.put(`/sales/${newId}`, { tx_hash: txHash });
                toast.success('Sale added!');
            } else {
                await api.put(`/sales/${editId}`, form);
                toast.success('Sale updated!');
            }
            setModal(null); load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); } finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this sale?')) return;
        try { await api.delete(`/sales/${id}`); toast.success('Deleted'); load(); }
        catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    };

    return (
        <Layout>
            <div className="page-header">
                <div><h1 className="page-title">Sales</h1><p className="page-sub">{sales.length} total sales transactions</p></div>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Sale</button>
            </div>

            {!CONTRACT_ADDRESS && (
                <div className="alert alert-info" style={{ marginBottom: 16 }}>
                    ⛓️ <strong>Blockchain not connected.</strong> Run Hardhat to enable on-chain sale recording. Sales will still be saved to the database.
                </div>
            )}

            {loading ? <div className="spinner" /> : (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr><th>#</th><th>Product</th><th>Qty</th><th>Price</th><th>Date</th><th>Blockchain</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {sales.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No sales yet</td></tr>
                            ) : sales.map((s, i) => (
                                <tr key={s.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                                    <td style={{ fontWeight: 500 }}>{s.product_name}</td>
                                    <td>{s.qty}</td>
                                    <td>₹{parseFloat(s.price).toLocaleString('en-IN')}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.date}</td>
                                    <td>
                                        {s.tx_hash ? (
                                            <span className="badge badge-success" title={s.tx_hash}>⛓️ On-chain</span>
                                        ) : (
                                            <span className="badge badge-warning">DB only</span>
                                        )}
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}>✏️</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>🗑️</button>
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
                            <h3 className="modal-title">{modal === 'add' ? '+ Add Sale' : 'Edit Sale'}</h3>
                            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product *</label>
                                <select className="form-control" value={form.product_id} onChange={handleProductChange} required>
                                    <option value="">Select product…</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Quantity *</label>
                                    <input type="number" min="1" className="form-control" value={form.qty} onChange={handleQtyChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Total Price (₹) *</label>
                                    <input type="number" step="0.01" className="form-control" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input type="date" className="form-control" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                            </div>
                            {modal === 'add' && CONTRACT_ADDRESS && (
                                <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, marginBottom: 16, fontSize: 13, color: 'var(--accent-light)' }}>
                                    ⛓️ This sale will also be recorded on the Ethereum blockchain via MetaMask.
                                </div>
                            )}
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : modal === 'add' ? '+ Record Sale' : '💾 Update'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
