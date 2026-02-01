# FastAPI + Keycloak Integration

This project provides a FastAPI backend integrated with Keycloak for Authentication and Authorization.

## Features
- **FastAPI** with `fastapi-keycloak-middleware`.
- **Keycloak** integration supporting Social Login and Email Verification.
- **Dockerized** setup for easy deployment.
- **RBAC**: Protected routes based on roles.

## Prerequisite
- Docker and Docker Compose installed.

## Getting Started

1. **Spin up the services:**
   ```bash
   docker-compose up -d
   ```

2. **Configure Keycloak:**
   - Access the admin console at `http://localhost:8080/auth/admin` (User: `admin`, Pass: `admin`).
   - Create a Realm named `elinara-realm`.
   - Create a Client:
     - **Client ID**: `elinara-client` (The unique identifier for your app).
     - **Client Authentication**: Set to **ON** (In Step 2: Capability config). This is the equivalent of "Access Type: Confidential".
     - **Authentication Flow**: Ensure **Standard Flow** is checked.
     - **Valid Redirect URIs**: `*` (Allows Keycloak to redirect back to your app after login).
     - **Web Origins**: `*` (Allows your frontend to make requests to Keycloak - CORS).
     - Save and copy the **Client Secret** from the 'Credentials' tab.
   - Update `docker-compose.yml` with the `KEYCLOAK_CLIENT_SECRET`.

## Understanding the Configuration

| Element | Importance | Why we need it |
| :--- | :--- | :--- |
| **Realm** | A isolated space for users and clients. | It separates different projects/apps. Think of it as a "Project" container. |
| **Client ID** | The unique name of your application. | Keycloak needs to know which app is requesting a login to apply its specific roles and settings. |
| **Client Authentication** | Formerly "Access Type: Confidential". | When **ON**, the application must use a **Secret** to talk to Keycloak. This is required for backends (FastAPI) to safely verify tokens. |
| **Valid Redirect URIs** | Security filter for the browser. | Prevents attackers from stealing tokens by forcing Keycloak to only send the user back to your approved URLs. |
| **Web Origins** | CORS Security. | Tells the browser that your frontend (e.g., localhost:3000) is allowed to talk to the Keycloak server. |
| **Social Logins** | User convenience. | Allows registration without a new password via Google/GitHub, leveraging their existing trust. |

## UI Guide for Keycloak 24

> [!TIP]
> **Missing "Access Type"?**
> In newer Keycloak versions, "Access Type" is now under **Capability config** (Step 2 of the wizard). 
> - **Client authentication = ON** means "Confidential" (Secure, uses a Secret).
> - **Client authentication = OFF** means "Public" (Used for purely frontend apps).
>
> For our FastAPI backend, you **MUST** set it to **ON**.


3. **Roles and Users:**
   - Create a Role named `admin` in the realm.
   - Create a User, set a password (temporary=off), and assign the `admin` role in 'Role Mapping'.

4. **Social Login (Google/GitHub):**
   - In 'Identity Providers', select Google or GitHub.
   - Follow Keycloak documentation to provide Client ID and Secret from Google Cloud / GitHub OAuth apps. 

   Google Redirect URI: `http://localhost:8080/realms/elinara-realm/broker/google/endpoint`

5. **Email Verification & SMTP:**
   - Go to **Realm Settings** -> **Login**.
   - Enable **Verify email**.
   - Go to **Realm Settings** -> **Email** tab.
   - Fill the form as follows:

### SMTP Form Explanation

| Field | Description |
| :--- | :--- |
| **From** | The email address shown to users (e.g., `no-reply@elinara.com`). |
| **From display name** | The name shown in the inbox (e.g., `Elinara Auth`). |
| **Host** | The SMTP server address (e.g., `smtp.mailtrap.io` or `smtp.gmail.com`). |
| **Port** | Use `587` for StartTLS or `465` for SSL. |
| **Encryption** | Check **Enable StartTLS** (recommended for most modern services). |
| **Authentication** | Toggle **ON** and provide your SMTP Username and Password. |

> [!TIP]
> **Testing with Mailtrap**
> For local development, use **Mailtrap.io**. It provides a "Fake SMTP" server that catches all emails in a virtual inbox, so you don't accidentally send real emails to users during testing.
>
> **Using Gmail?**
> If you use Gmail, you must:
> 1. Enable 2-Factor Authentication on your Google account.
> 2. Generate an **App Password** (NOT your regular password) and use that in the "Password" field.

## API Endpoints

### 1. Root
- **URL:** `/`
- **Method:** `GET`
- **Description:** Basic health check.
- **Response:** `{"message": "Welcome..."}`

### 2. Items (Protected)
- **URL:** `/items`
- **Method:** `GET`
- **Auth:** Required (JWT from Keycloak)
- **Description:** Accessible to any authenticated user.
- **Response:** `{"items": [...]}`

### 3. Admin (Restricted)
- **URL:** `/admin`
- **Method:** `GET`
- **Auth:** Required (JWT with `admin` role)
- **Description:** Restricted to users with the `admin` role.
- **Response:** `{"message": "Welcome Admin!"}`

## Authentication & Social Login Flow

In this architecture, **FastAPI does not have `login` or `register` endpoints.** 

Keycloak is an **Identity as a Service (IDaaS)** provider. It handles the entire user interface and logic for:
1. **User Registration**: Custom fields, password policies, and email verification.
2. **Social Login**: Google, Facebook, GitHub, Microsoft (Outlook), etc.
3. **Login Page**: A hosted login page that returns a JWT to your frontend application.

### Why this is better:
- **Security**: Your backend never touches user passwords.
- **Flexibility**: You can add social login (Google/Outlook) by simply clicking buttons in the Keycloak Admin Console without changing a single line of FastAPI code.
- **Compliance**: Standards like OAuth2 and OpenID Connect (OIDC) are handled for you.

### How to Login / Register:
1. **Frontend**: Your frontend (React, Vue, Browser) redirects users to:  
   `http://localhost:8080/realms/myrealm/protocol/openid-connect/auth?client_id=fastapi-client&...`
2. **Keycloak UI**: User sees the login/register page. If Social Login is enabled, they see "Login with Google".
3. **Success**: Keycloak redirects back to your frontend with a **Token**.
4. **FastAPI**: Your frontend sends this token in the `Authorization: Bearer <token>` header. Our middleware validates it and populates `user_id`, `email`, and `roles`.

## Troubleshooting & Common Errors

### 1. Error: "Container Keycloak is unhealthy"
- **Cause**: The healthcheck was using `curl`, which is not installed in the default Keycloak image, or the healthcheck timed out before Keycloak finished its heavy startup process.
- **Solution**: The `docker-compose.yml` has been updated to remove the strict healthcheck. If you want a healthcheck, use a TCP socket check or ensure `KC_HEALTH_ENABLED=true` and use `/health/live`.

### 2. Error: "Page not found" when accessing Admin Console
- **Cause**: Confusion between legacy `/auth` path and the new default Keycloak 24 path.
- **Solution**: By default, Keycloak 24 uses `http://localhost:8080/admin`. If you want the old path, you must set `KC_HTTP_RELATIVE_PATH: /auth` in the environment variables.

### 3. Error: "Invalid username or password" on first login
- **Cause**: Using old or incorrect environment variables (like `KC_BOOTSTRAP_...`) or trying to change credentials without clearing the database.
- **Solution**: Use `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD`. If it fails, you **must** wipe the database to reset the bootstrap state:
  ```bash
  sudo docker-compose down --volumes
  sudo docker-compose up -d
  ```

### 4. Backend can't connect to Keycloak
- **Cause**: The FastAPI app starts faster than Keycloak and fails the OIDC discovery.
- **Solution**: The `docker-compose.yml` uses `depends_on`, but since Keycloak is slow, the backend might restart a few times. This is normal; it will eventually connect once Keycloak is fully up.

### 5. Social Login button not appearing
- **Cause**: Redirect URIs or Client Scopes are misconfigured in the Admin Console.
- **Solution**: Ensure your "Valid Redirect URIs" in the Client settings include `*` (for dev) or your actual frontend URL.

