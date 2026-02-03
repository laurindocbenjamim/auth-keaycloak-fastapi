# 🚀 Deploying to Render

This guide explains how to deploy the Frontend and Backend as separate apps on [Render](https://render.com).

## 1. Backend Deployment (FastAPI)

1.  **Create a New Web Service**:
    - Connect your GitHub repository.
    - **Language**: `Python`
    - **Root Directory**: `auth-backend`
    - **Build Command**: `pip install -r requirements.txt`
    - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

2.  **Environment Variables**:
    Add the following in the **Environment** tab:
    - `KEYCLOAK_URL`: Your Keycloak URL (e.g., `https://your-keycloak.onrender.com`)
    - `KEYCLOAK_REALM`: `elinara-realm`
    - `KEYCLOAK_CLIENT_ID`: `elinara-backend`
    - `KEYCLOAK_CLIENT_SECRET`: `[Your Secret]`

---

## 2. Frontend Deployment (Vite/React)

1.  **Create a New Static Site**:
    - Connect your GitHub repository.
    - **Root Directory**: `auth-frontend`
    - **Build Command**: `npm install && npm run build`
    - **Publish Directory**: `dist`

2.  **Environment Variables**:
    Add the following in the **Environment** tab:
    - `VITE_KEYCLOAK_URL`: Your Keycloak URL
    - `VITE_KEYCLOAK_REALM`: `elinara-realm`
    - `VITE_KEYCLOAK_CLIENT_ID`: `elinara-frontend`
    - `VITE_API_BASE_URL`: The URL of your **Backend Web Service** (e.g., `https://auth-backend.onrender.com`)

---

## 3. Keycloak Deployment (Docker)

Render can run Keycloak using a **Web Service** with a Dockerfile.

1.  **Create a New Web Service**:
    - Select **Docker** as the Runtime.
    - Use the [official Keycloak Docker image](https://quay.io/repository/keycloak/keycloak).
    - **Environment Variables**:
      - `KC_HOSTNAME`: `your-keycloak.onrender.com`
      - `KEYCLOAK_ADMIN`: `admin`
      - `KEYCLOAK_ADMIN_PASSWORD`: `[Your Password]`
      - `KC_DB`: `postgres` (Connect to a Render PostgreSQL database)

---

## ⚠️ Important Post-Deployment Steps

1.  **Keycloak Redirect URIs**:
    - Update your Keycloak client settings (`elinara-frontend`) with the new Render Frontend URL in **Valid Redirect URIs** and **Web Origins**.
2.  **CORS**:
    - Ensure your backend `main.py` allows your Render Frontend URL in its CORS configuration.
