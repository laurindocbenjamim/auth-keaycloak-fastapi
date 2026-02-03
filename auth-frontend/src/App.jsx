import React, { useState, useEffect } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const App = () => {
    const { keycloak, initialized } = useKeycloak();
    const [apiResult, setApiResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // overview, services, settings, users
    const [users, setUsers] = useState([]);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Sync user with backend on login
    useEffect(() => {
        if (keycloak.authenticated) {
            fetch(`${import.meta.env.VITE_API_BASE_URL}/users/sync`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${keycloak.token}`,
                },
            });
        }
    }, [keycloak.authenticated, keycloak.token]);

    // Fetch all users when the users tab is active
    useEffect(() => {
        if (activeTab === 'users' && keycloak.authenticated) {
            setLoading(true);
            fetch(`${import.meta.env.VITE_API_BASE_URL}/users/`, {
                headers: {
                    Authorization: `Bearer ${keycloak.token}`,
                },
            })
                .then(res => res.json())
                .then(data => {
                    setUsers(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Fetch users error:", err);
                    setLoading(false);
                });
        }
    }, [activeTab, keycloak.authenticated, keycloak.token]);

    const handleCallApi = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/protected`, {
                headers: {
                    Authorization: `Bearer ${keycloak.token}`,
                },
            });
            const data = await response.json();
            setApiResult(JSON.stringify(data, null, 2));
        } catch (error) {
            setApiResult('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    if (!initialized) {
        return <div className="loading">Initializing Session...</div>;
    }

    const mockServices = [
        { id: 1, name: "Cloud Analytics Pro", status: "active", created: "2024-01-15", expires: "2025-01-15" },
        { id: 2, name: "Neural Network API", status: "pending", created: "2024-02-01", expires: "2024-03-01" },
        { id: 3, name: "Legacy Data Hub", status: "expired", created: "2023-01-10", expires: "2024-01-10" },
    ];

    const formatAddress = (addr) => {
        if (!addr) return 'No address';
        if (typeof addr === 'object') {
            return addr.formatted || JSON.stringify(addr);
        }
        return addr;
    };

    return (
        <div className="layout-wrapper">
            <div className="background-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            {!keycloak.authenticated ? (
                <div className="container">
                    <main className="hero">
                        <div className="hero-logo-container">
                            <img
                                src="/brand/output.gif"
                                alt="Elinara Logo"
                                className="hero-animated-logo"
                            />
                        </div>
                        <h1>Elinara <span className="gradient-text">Engineering</span></h1>
                        <p>Elinara is a premier tech company providing world-class IT engineering services. Experience secure, enterprise-grade identity management and seamless system integration.</p>
                        <div className="actions">
                            <button onClick={() => keycloak.login()} className="btn-primary">
                                Gets Started
                            </button>
                        </div>
                    </main>
                </div>
            ) : (
                <div className={`dashboard-layout ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                    {/* Left Sidebar */}
                    <aside className="side-menu">
                        <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <div className="sidebar-header" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {isSidebarCollapsed ? (
                                    <img src="/brand/apple-touch-icon.png" alt="Elinara Logo" style={{ width: '32px', height: '32px' }} />
                                ) : (
                                    <span className="logo" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '1px' }}>ELINARA</span>
                                )}
                                <button
                                    className="toggle-sidebar-btn"
                                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                                    title={isSidebarCollapsed ? "Expand Menu" : "Collapse Menu"}
                                >
                                    {isSidebarCollapsed ? '→' : '←'}
                                </button>
                            </div>

                            <nav className="menu-section" style={{ flex: 1, padding: '0', display: 'flex', flexDirection: 'column' }}>
                                <h3>{isSidebarCollapsed ? '' : 'Management'}</h3>
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
                                    title="Overview"
                                >
                                    🏠 {!isSidebarCollapsed && 'Overview'}
                                </button>
                                <button
                                    onClick={() => setActiveTab('services')}
                                    className={`menu-item ${activeTab === 'services' ? 'active' : ''}`}
                                    title="Services"
                                >
                                    ⚡ {!isSidebarCollapsed && 'All Services'}
                                </button>
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`menu-item ${activeTab === 'users' ? 'active' : ''}`}
                                    title="User Directory"
                                >
                                    👥 {!isSidebarCollapsed && 'User Directory'}
                                </button>
                                <button
                                    onClick={() => setActiveTab('settings')}
                                    className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
                                    title="Configuration"
                                >
                                    ⚙️ {!isSidebarCollapsed && 'Configuration'}
                                </button>

                                <h3>{isSidebarCollapsed ? '' : 'Help & Support'}</h3>
                                <button className="menu-item" title="Documentation">📖 {!isSidebarCollapsed && 'Documentation'}</button>
                                <button className="menu-item" title="Contact Admin">💌 {!isSidebarCollapsed && 'Contact Admin'}</button>
                            </nav>

                            <button onClick={handleLogout} className="menu-item btn-logout" title="Sign Out">
                                ⎋ {!isSidebarCollapsed && 'Sign Out'}
                            </button>
                        </div>
                    </aside>

                    {/* Right Side Column (TopBar + Content) */}
                    <div className="content-container">
                        <header className="top-bar">
                            <div
                                className={`top-bar-user ${isDropdownOpen ? 'active' : ''}`}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                style={{ position: 'relative' }}
                            >
                                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{keycloak.tokenParsed?.name || 'User'}</span>
                                <div className="top-bar-avatar">
                                    {(keycloak.tokenParsed?.given_name?.[0] || 'U').toUpperCase()}
                                </div>

                                {isDropdownOpen && (
                                    <div className="user-dropdown glass-panel">
                                        <div className="dropdown-header">
                                            <p className="dropdown-name">{keycloak.tokenParsed?.name}</p>
                                            <p className="dropdown-email">{keycloak.tokenParsed?.email}</p>
                                        </div>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item" onClick={() => setActiveTab('overview')}>
                                            👤 My Profile
                                        </button>
                                        <button className="dropdown-item" onClick={() => setActiveTab('settings')}>
                                            ⚙️ Edit Settings
                                        </button>
                                        <div className="dropdown-divider"></div>
                                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                                            ⎋ Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </header>

                        <main className="main-content">
                            {activeTab === 'overview' && (
                                <section className="glass-panel" style={{ animation: 'slideUp 0.6s ease-out' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Welcome Back, {keycloak.tokenParsed?.given_name || 'User'}!</h2>

                                    <div className="user-info">
                                        <div className="info-group">
                                            <label>Email Address</label>
                                            <p>{keycloak.tokenParsed?.email || 'N/A'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Phone Detail</label>
                                            <p>{keycloak.tokenParsed?.phone_number || 'No number'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Full Name</label>
                                            <p>{keycloak.tokenParsed?.name || 'N/A'}</p>
                                        </div>
                                        <div className="info-group">
                                            <label>Location</label>
                                            <p>{formatAddress(keycloak.tokenParsed?.address)}</p>
                                        </div>
                                    </div>

                                    <div className="api-test">
                                        <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Backend Connectivity</h3>
                                        <button onClick={handleCallApi} className="btn-primary" disabled={loading}>
                                            {loading ? 'Verifying...' : 'Test Backend Gateway'}
                                        </button>
                                        <pre>{apiResult || '// API response will appear here after verification'}</pre>
                                    </div>

                                    {/* Admin Debug Section moved to Overview */}
                                    {keycloak.tokenParsed?.realm_access?.roles?.includes('admin') && (
                                        <div className="debug-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                            <h3 style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--primary-glow)' }}>🛡️ Admin Debug: Raw Token Data</h3>
                                            <pre style={{ fontSize: '0.75rem', maxHeight: '250px', overflowY: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                                {JSON.stringify(keycloak.tokenParsed, null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </section>
                            )}

                            {activeTab === 'services' && (
                                <section className="glass-panel" style={{ animation: 'slideUp 0.6s ease-out' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Active Services</h2>
                                    <div className="services-table-container">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Service Name</th>
                                                    <th>Status</th>
                                                    <th>Created</th>
                                                    <th>Expiration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockServices.map(service => (
                                                    <tr key={service.id}>
                                                        <td style={{ fontWeight: 600 }}>{service.name}</td>
                                                        <td>
                                                            <span className={`status-badge status-${service.status}`}>
                                                                {service.status.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td>{service.created}</td>
                                                        <td>{service.expires}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            )}

                            {activeTab === 'users' && (
                                <section className="glass-panel" style={{ animation: 'slideUp 0.6s ease-out' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Registered Users (DB Storage)</h2>
                                    {loading ? <p>Loading directory...</p> : (
                                        <div className="services-table-container">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Role</th>
                                                        <th>Status</th>
                                                        <th>Phone</th>
                                                        <th>Address</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {users.map(u => (
                                                        <tr key={u.user_id}>
                                                            <td style={{ fontWeight: 600 }}>{u.full_name}</td>
                                                            <td>{u.email}</td>
                                                            <td>
                                                                <span className={`status-badge ${u.role === 'admin' ? 'status-active' : 'status-pending'}`} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>
                                                                    {u.role?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`status-badge status-${u.status}`} style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>
                                                                    {u.status?.toUpperCase()}
                                                                </span>
                                                            </td>
                                                            <td>{u.phone_number || '-'}</td>
                                                            <td>{u.address || '-'}</td>
                                                        </tr>
                                                    ))}
                                                    {users.length === 0 && (
                                                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No users synchronized yet.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </section>
                            )}

                            {activeTab === 'settings' && (
                                <section className="glass-panel" style={{ animation: 'slideUp 0.6s ease-out' }}>
                                    <h2 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>Account Configuration</h2>
                                    <div className="config-grid">
                                        <div className="config-card">
                                            <h4>Security Settings</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Manage your two-factor authentication and login history.</p>
                                        </div>
                                        <div className="config-card">
                                            <h4>Notifications</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Configure how and when you receive service alerts.</p>
                                        </div>
                                        <div className="config-card">
                                            <h4>API Access</h4>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Generate personal access tokens for developers.</p>
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* Debug section removed from persistent footer, moved to Overview (Admin Only) */}
                        </main>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
