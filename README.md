# Elinara Auth - Separated Architecture

This project is now structured to run the **Backend** and **Frontend** as completely independent services, allowing you to host them on different servers.

## Project Layout

- `auth-backend/`: Contains the FastAPI application and the Keycloak/Postgres infrastructure.
- `auth-frontend/`: Contains the premium React/Vite application.

---

## 1. Backend & Infrastructure (`auth-backend`)

The backend folder contains the source of truth for your authentication.

1. **Setup**:
   ```bash
   cd auth-backend
   # Ensure .env exists with KEYCLOAK_CLIENT_SECRET
   sudo docker-compose up -d
   ```
2. **Access**:
   - Backend API: `http://localhost:8000`
   - Keycloak: `http://localhost:8080/admin`

---

## 2. Frontend Application (`auth-frontend`)

The frontend is a standalone Vite app that connects to the backend and Keycloak via environment variables.

1. **Configuration**:
   Edit `auth-frontend/.env` to point to your hosted Backend and Keycloak URLs:
   ```env
   VITE_KEYCLOAK_URL=http://your-keycloak-host:8080
   VITE_API_BASE_URL=http://your-backend-host:8000
   ```

2. **Run with Docker**:
   ```bash
   cd auth-frontend
   sudo docker-compose up -d
   ```
3. **Run for Development**:
   ```bash
   cd auth-frontend
   npm install
   npm run dev
   ```

## Production Tips:
- **CORS**: In `auth-backend/main.py`, update `allow_origins` to your production frontend domain.
- **Keycloak Hostname**: In `auth-backend/docker-compose.yml`, update `KC_HOSTNAME_URL` to your production Keycloak domain.
## Troubleshooting
### Google Social Login (Error 400: `redirect_uri_mismatch`)
This error happens because the Redirect URI in your **Google Cloud Console** doesn't match the one Keycloak is sending.

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Edit your **OAuth 2.0 Client ID**.
3. Under **Authorized redirect URIs**, add this exact URL:
   `http://localhost:8080/realms/elinara-realm/broker/google/endpoint`
4. **Save** and wait 1-2 minutes for Google to update.

---
