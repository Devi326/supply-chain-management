import { useEffect, useState } from 'react';
import api from '../api/client';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, AreaChart, Area
} from 'recharts';

export default function Reports() {
    const [dailyData, setDailyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState({ start: '', end: '' });
    const [rangeResults, setRangeResults] = useState(null);
    const [rangeLoading, setRangeLoading] = useState(false);

    const loadCharts = async () => {
        setLoading(true);
        try {
            const year = new Date().getFullYear();
            const month = String(new Date().getMonth() + 1).padStart(2, '0');
            const [d, m] = await Promise.all([
                api.get(`/reports/daily?year=${year}&month=${month}`),
                api.get(`/reports/monthly?year=${year}`)
            ]);

            // Transform data for recharts
            setDailyData(d.data.data.map(item => ({
                day: item.date.split('-')[2],
                total: parseFloat(item.total_selling_price)
            })));

            setMonthlyData(m.data.data.map(item => ({
                month: item.date.split('-')[1],
                total: parseFloat(item.total_selling_price)
            })));
        } catch (err) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCharts(); }, []);

    const handleRangeSearch = async (e) => {
        e.preventDefault();
        if (!range.start || !range.end) return;
        setRangeLoading(true);
        try {
            const r = await api.get(`/reports/range?start=${range.start}&end=${range.end}`);
            setRangeResults(r.data);
        } catch (err) {
            toast.error('Search failed');
        } finally {
            setRangeLoading(false);
        }
    };

    return (
        <Layout>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Sales Reports</h1>
                    <p className="page-sub">Visualize and export supply chain performance</p>
                </div>
            </div>

            <div className="grid-2">
                <div className="card">
                    <h3 className="mb-4">Daily Sales (Current Month)</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={dailyData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${v}`} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--accent-light)' }}
                                />
                                <Area type="monotone" dataKey="total" stroke="var(--accent)" fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 className="mb-4">Monthly Sales Overview</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={v => `₹${v}`} />
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Bar dataKey="total" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card mt-4">
                <h3 className="mb-4">Custom Date Range Analysis</h3>
                <form onSubmit={handleRangeSearch} style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
                    <div className="form-group mb-0" style={{ flex: 1 }}>
                        <label className="form-label">Start Date</label>
                        <input type="date" className="form-control" value={range.start} onChange={e => setRange(r => ({ ...r, start: e.target.value }))} required />
                    </div>
                    <div className="form-group mb-0" style={{ flex: 1 }}>
                        <label className="form-label">End Date</label>
                        <input type="date" className="form-control" value={range.end} onChange={e => setRange(r => ({ ...r, end: e.target.value }))} required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: 24 }} disabled={rangeLoading}>
                        {rangeLoading ? '🔄 Searching...' : '🔍 Filter Reports'}
                    </button>
                </form>

                {rangeResults && (
                    <div>
                        <div className="stat-grid">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent)' }}>💰</div>
                                <div>
                                    <div className="stat-label">Revenue</div>
                                    <div className="stat-value">₹{rangeResults.summary.total_revenue.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)' }}>📉</div>
                                <div>
                                    <div className="stat-label">Cost</div>
                                    <div className="stat-value">₹{rangeResults.summary.total_cost.toLocaleString()}</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--success)' }}>📈</div>
                                <div>
                                    <div className="stat-label">Profit</div>
                                    <div className="stat-value">₹{rangeResults.summary.profit.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr><th>Date</th><th>Product</th><th>Sales Qty</th><th>Revenue</th><th>Cost</th></tr>
                                </thead>
                                <tbody>
                                    {rangeResults.data.map((r, i) => (
                                        <tr key={i}>
                                            <td>{r.date}</td>
                                            <td>{r.name}</td>
                                            <td>{r.total_sales}</td>
                                            <td>₹{parseFloat(r.total_selling_price).toLocaleString()}</td>
                                            <td>₹{parseFloat(r.total_buying_price).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
