import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import keycloak from './keycloak';
import App from './App';
import './index.css';

const eventLogger = (event, error) => {
    console.log('onKeycloakEvent', event, error);
};

const tokenLogger = (tokens) => {
    console.log('onKeycloakTokens', tokens);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ReactKeycloakProvider
            authClient={keycloak}
            onEvent={eventLogger}
            onTokens={tokenLogger}
            initOptions={{
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
            }}
        >
            <App />
        </ReactKeycloakProvider>
    </React.StrictMode>
);
