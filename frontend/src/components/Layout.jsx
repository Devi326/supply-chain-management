import Sidebar from './Sidebar';

export default function Layout({ children }) {
    return (
        <div className="layout">
            <Sidebar />
            <main className="main">{children}</main>
        </div>
    );
}
