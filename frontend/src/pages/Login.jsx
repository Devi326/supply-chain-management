import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' });
    const { login, loading, user } = useAuth();
    const navigate = useNavigate();

    // Immediate redirect if user is already logged in or just logged in
    useEffect(() => {
        if (user) {
            console.log("User detected, redirecting to dashboard...");
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log("Attempting login for:", form.username);
            await login(form.username, form.password);
            console.log("Login call completed successfully.");
        } catch (err) {
            console.error("Login attempt failed:", err);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-logo">
                    <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
                    <h1>EVehicle Supply Chain</h1>
                    <p>Web3-powered Management System</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <input
                            className="form-control"
                            placeholder="Enter username"
                            value={form.username}
                            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                            required
                            autoFocus
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Enter password"
                            value={form.password}
                            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: 8 }}
                        disabled={loading}
                    >
                        {loading ? '⏳ Signing in...' : '🔒 Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.2)' }}>
                    <div style={{ fontSize: 12, color: 'var(--accent-light)', fontWeight: 600, marginBottom: 4 }}>⛓️ Web3 Enabled</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sales are recorded on the Ethereum blockchain for immutable audit trails.</div>
                </div>
            </div>
        </div>
    );
}
