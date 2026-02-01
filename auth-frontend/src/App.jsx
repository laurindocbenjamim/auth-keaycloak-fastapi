import React, { useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const App = () => {
    const { keycloak, initialized } = useKeycloak();
    const [apiResult, setApiResult] = useState('Click to test connection...');
    const [loading, setLoading] = useState(false);
    const [initError, setInitError] = useState(null);

    // Listen for Keycloak errors
    React.useEffect(() => {
        if (initialized && !keycloak.authenticated && window.location.hash.includes('error=')) {
            setInitError("Authentication error detected in URL. Check Keycloak logs.");
        }
    }, [initialized, keycloak.authenticated]);

    if (initError) {
        return (
            <div className="loading" style={{ flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: '#f87171', fontSize: '1.5rem', fontWeight: 'bold' }}>Initialization Issue</p>
                <p style={{ fontSize: '1.1rem', color: '#94a3b8', marginTop: '1rem', maxWidth: '400px' }}>
                    {initError}
                </p>
                <button onClick={() => window.location.reload()} className="btn-secondary" style={{ marginTop: '2rem' }}>
                    Try Again
                </button>
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
                                <label>Phone Number</label>
                                <p>{keycloak.tokenParsed?.phone_number || 'Not provided'}</p>
                            </div>
                            <div className="info-group">
                                <label>Full Name</label>
                                <p>{keycloak.tokenParsed?.name || 'N/A'}</p>
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
                    </div>
                </main>
            )}
        </div>
    );
};

export default App;
