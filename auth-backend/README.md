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

4. **Traditional Email/Password Registration:**
   - Go to **Realm Settings** -> **Login** tab.
   - Toggle **User registration** to **ON**. This adds a "Register" link to the login page.
   - Toggle **Verify email** to **ON**. This makes email confirmation mandatory.
   - (Optional) Toggle **Forgot password** to **ON** to allow password resets.

### How the Verification Flow Works
1. **Registration**: The user clicks "Register" on the Keycloak login page and enters their details.
2. **Mandatory Action**: After clicking "Register", Keycloak detects that "Verify email" is required.
3. **Email Sent**: Keycloak sends an email via your SMTP server with a **Magic Link**.
4. **Access Blocked**: The user is shown a page saying "You need to verify your email to activate your account." They cannot access FastAPI yet.
5. **Confirmation**: Once the user clicks the link in their email, Keycloak marks the account as verified and redirects them to the app with a valid token.
5. **Step 5: Adding Custom Fields (e.g., Phone Number)**
   In Keycloak 24, you can add custom fields to the registration form using the **User Profile** feature:
   - Go to **Realm Settings** -> **User Profile** tab.
   - Click **Create attribute**:
     - **Attribute name**: `phone_number` (Must match the name in `main.py`).
     - **Display name**: `Phone Number (with Country Code)`.
   - In **Permissions & Validators**:
     - **Required**: Toggle to **Required** for both Users and Admins.
     - **Can user edit?**: YES.
     - **Can admin edit?**: YES.
   - **Save**. The "Register" page will now automatically include this field.

6. **Step 6: Email Verification & SMTP:**
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

### How to Test in Postman (Traditional vs. Social):

- **Traditional Login**: Use the **Password Credentials** grant type in Postman (as described in the [walkthrough](file:///home/feti/.gemini/antigravity/brain/10137c01-c0d7-4c76-814d-926ead016b52/walkthrough.md)). This uses the exact same `/token` endpoint.
- **Social Login**: In Postman, switch the Grant Type to **Authorization Code**. Set the **Callback URL** to `https://www.getpostman.com/oauth2/callback`. Keycloak will then open its UI, allowing you to click "Login with Google".
- **Verification**: Once you have the token, hit the `/items` endpoint. You should see `"phone_number": "+123456789"` in the response if you configured it correctly.

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

### 4. Error 500: "Realm does not exist" (404)
- **Cause**: The backend is searching for a realm that has a typo (case-sensitive!) or doesn't exist.
- **Solution**: Ensure your realm name in Keycloak matches the `KEYCLOAK_REALM` environment variable exactly (e.g., `elinara-realm`).

### 5. Error 500: Internal Server Error (Networking)
- **Cause**: The Backend uses internal Docker names (`http://keycloak:8080`), but tokens are issued for `localhost:8080`, or the backend can't reach the Keycloak container.
- **Solution**: 
  - Set `KEYCLOAK_URL: http://keycloak:8080` in `docker-compose.yml` for the backend.
  - Set `KC_HOSTNAME_URL: http://localhost:8080` for Keycloak to fix the `iss` (issuer) claim mismatch.

### 6. Error: "Account is not fully set up" (during token retrieval)
- **Cause**: Required actions (Verify Email, Update Password) are pending for the user.
- **Solution**: In Keycloak Admin, go to the user's profile and **REMOVE** all entries in the **Required Actions** list.

### 7. Issue: Social Login button or Authorization failing
- **Cause**: Enabling the "Authorization" toggle in Client settings adds complex requirements.
- **Solution**: Keep **Authorization: OFF** and **Client Authentication: ON**.


