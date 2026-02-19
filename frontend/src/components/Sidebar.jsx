import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '🏠', minLevel: 3 },
    { to: '/products', label: 'Products', icon: '📦', minLevel: 3 },
    { to: '/categories', label: 'Categories', icon: '🏷️', minLevel: 3 },
    { to: '/sales', label: 'Sales', icon: '💰', minLevel: 3 },
    { to: '/media', label: 'Media', icon: '🖼️', minLevel: 2 },
    { to: '/reports', label: 'Reports', icon: '📊', minLevel: 3 },
    { to: '/users', label: 'Users', icon: '👥', minLevel: 2 },
    { to: '/groups', label: 'Groups', icon: '🔑', minLevel: 1 },
];

export default function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate('/'); };
    const userLevel = parseInt(user?.user_level || 3);

    return (
        <aside className="sidebar">
            <div style={{ padding: '0 14px 16px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    {userLevel === 1 ? 'Admin' : userLevel === 2 ? 'Manager' : 'Customer'}
                </div>
            </div>

            <div className="sidebar-section">Navigation</div>
            {navItems.filter(i => userLevel <= i.minLevel).map(item => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                </NavLink>
            ))}

            <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button className="sidebar-link" onClick={handleLogout} style={{ color: 'var(--danger)' }}>
                    <span>🚪</span><span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
