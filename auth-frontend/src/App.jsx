import React, { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const App = () => {
    const { keycloak, initialized } = useKeycloak();
    const [apiResult, setApiResult] = useState('Click to test connection...');
    const [loading, setLoading] = useState(false);
    const [initError, setInitError] = useState(null);

    const [initTimeout, setInitTimeout] = useState(false);

    // Initialization Timeout
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (!initialized) {
                setInitTimeout(true);
            }
        }, 8000); // 8 seconds
        return () => clearTimeout(timer);
    }, [initialized]);

    // Listen for Keycloak errors
    React.useEffect(() => {
        if (initialized && !keycloak.authenticated && window.location.hash.includes('error=')) {
            setInitError("Authentication error detected in URL. Please check Keycloak logs.");
        }
    }, [initialized, keycloak.authenticated]);

    if (initError || (initTimeout && !initialized)) {
        return (
            <div className="loading" style={{ flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {initError ? "Initialization Issue" : "Taking longer than usual..."}
                </p>
                <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginTop: '1rem', maxWidth: '450px' }}>
                    {initError || "Keycloak is taking too long to respond. This usually happens due to a network timeout or a misconfigured 'Web Origin' in Keycloak Client settings."}
                </p>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button onClick={() => window.location.reload()} className="btn-secondary">
                        Retry Refresh
                    </button>
                    <button onClick={() => window.location.href = window.location.origin} className="btn-outline">
                        Go to Home
                    </button>
                </div>
                <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.7 }}>
                    Check F12 Console for detailed errors.
                </p>
            </div>
        );
    }

    if (!initialized) {
        return <div className="loading">Initializing Secure Session...</div>;
    }

    const handleCallApi = async () => {
        setLoading(true);
        setApiResult('Calling API...');
        try {
            const response = await fetch(`${API_BASE_URL}/items`, {
                headers: {
                    'Authorization': `Bearer ${keycloak.token}`,
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

    return (
        <div id="app">
            <div className="background-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <nav>
                <div className="logo">ELINARA</div>
                {keycloak.authenticated && (
                    <div id="nav-user">
                        <span id="user-display-name">
                            Hello, {keycloak.tokenParsed?.given_name || keycloak.tokenParsed?.preferred_username}
                        </span>
                        <button onClick={() => keycloak.logout()} className="btn-secondary" style={{ marginLeft: '1rem' }}>
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            {!keycloak.authenticated ? (
                <main className="container">
                    <div className="hero">
                        <h1>Secure your <span className="gradient-text">Identity</span></h1>
                        <p>Experience the next generation React authentication with Keycloak and Elinara.</p>
                        <div className="actions">
                            <button onClick={() => keycloak.login()} className="btn-primary">Sign In</button>
                            <button onClick={() => keycloak.register()} className="btn-outline">Create Account</button>
                        </div>
                    </div>
                </main>
            ) : (
                <main className="container">
                    <div className="dashboard-card glass">
                        <h2>User Dashboard</h2>
                        <div className="user-info">
                            <div className="info-group">
                                <label>Email</label>
                                <p>{keycloak.tokenParsed?.email || 'N/A'}</p>
                            </div>
                            <div className="info-group">
                                <label>Phone Detail</label>
                                <p>
                                    {keycloak.tokenParsed?.country_code ? `(${keycloak.tokenParsed.country_code}) ` : ''}
                                    {keycloak.tokenParsed?.phone_number || 'No number'}
                                </p>
                            </div>
                            <div className="info-group">
                                <label>Full Name</label>
                                <p>{keycloak.tokenParsed?.name || 'N/A'}</p>
                            </div>
                            <div className="info-group">
                                <label>Address</label>
                                <p>
                                    {typeof keycloak.tokenParsed?.address === 'object'
                                        ? (keycloak.tokenParsed.address.formatted || JSON.stringify(keycloak.tokenParsed.address))
                                        : (keycloak.tokenParsed?.address || 'No address')}
                                </p>
                            </div>
                        </div>
                        <div className="api-test">
                            <button
                                onClick={handleCallApi}
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Calling...' : 'Test Backend API'}
                            </button>
                            <pre>{apiResult}</pre>
                        </div>

                        <div className="debug-section" style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                            <h3 style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '0.5rem' }}>Debug: Raw Token Data</h3>
                            <pre style={{ fontSize: '0.75rem', maxHeight: '200px', overflow: 'auto', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                                {JSON.stringify(keycloak.tokenParsed, null, 2)}
                            </pre>
                        </div>
                    </div>
                </main>
            )}
        </div>
    );
};

export default App;
