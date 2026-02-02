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

### 🌍 Adding a Country Code Selector (Keycloak 24)
To let users select their country code from a dropdown:

1.  In Keycloak Admin, go to **Realm Settings** -> **User Profile**.
2.  Switch to the **JSON Editor** tab.
3.  Add this new attribute to the `attributes` array (or merge it with your `phone_number`):

4.  **Full Reference (Nesting)**:
    Ensure you add it inside the `attributes: [...]` array. It should look like this:

```json
{
  "attributes": [
    { "name": "username", ... },
    { "name": "email", ... },
    {
      "name": "country_code",
      "displayName": "Country Code",
      "annotations": {
        "inputType": "select",
        "inputOptionLabels": {
          "US": "+1 (USA)",
          "AO": "+244 (Angola)",
          "MZ": "+258 (Mozambique)",
          "PT": "+351 (Portugal)",
          "BR": "+55 (Brazil)",
          "ZA": "+27 (South Africa)"
        }
      },
      "validations": {
        "options": {
          "options": ["US", "AO", "MZ", "PT", "BR", "ZA"]
        }
      },
      "permissions": {
        "view": ["user", "admin"],
        "edit": ["user", "admin"]
      }
    }
  ]
}
---

## 🛠️ Common Integration Pitfalls & Solutions

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **401 Unauthorized** | Client set to "Confidential" | In Keycloak, set **Client Authentication** to **OFF** for the frontend client. |
| **CORS Error** | Backend blocks frontend origin | Add `http://localhost:3000` to `allow_origins` in `auth-backend/main.py`. |
| **Initializing... Hang** | Web Origins missing | Add `http://localhost:3000` to **Web Origins** in Keycloak Client settings. |
| **Invalid Realm** | Realm name mismatch | Ensure `VITE_KEYCLOAK_REALM` in `.env` matches exact Keycloak name. |

---

## 📍 Social Login: Map Phone & Address (Google)

To get data like Phone Number and Address from Google login:

1.  **Google Cloud Console**:
    *   **CRITICAL**: Go to **APIs & Services** -> **Library** and search for **"Google People API"**. Click **Enable**. (Sem isto, os escopos de telefone/morada darão erro).
    *   In your **OAuth consent screen**, add these **EXACT** scopes manually (use the "Add Scope" or "Paste Scopes" box):
        *   `https://www.googleapis.com/auth/user.phonenumbers.read`
        *   `https://www.googleapis.com/auth/user.addresses.read`
2.  **Keycloak Identity Provider Configuration**:
    *   Go to **Identity Providers** -> **Google**.
    *   In the **Mappers** tab, create two new mappers:
        *   **Mapper 1 (Phone)**: 
            *   Name: `google-phone`
            *   Mapper Type: `Attribute Importer`
            *   Social Claim: `phone_number`
            *   User Attribute Name: `phone_number`
        *   **Mapper 2 (Address)**: 
            *   Name: `google-address`
            *   Mapper Type: `Attribute Importer`
            *   Social Claim: `address`
            *   User Attribute Name: `address`
3.  **Client Scopes**:
    *   Ensure the `phone` and `address` scopes are in the **Default Client Scopes** of your `elinara-frontend` client.

> [!NOTE]
> Google only shares phone/address if the user has them set in their public profile and grants permission during login.
### 🔗 Automatic Account Linking (Fix "Account already exists")
If users see a "Review Profile" or "Account already exists" screen when logging in with Google, follow these steps:

1.  **Trust Email**:
    - Go to **Identity Providers** -> **Google**.
    - Set **Trust Email** to **ON**. This tells Keycloak to trust that Google has verified the user's email.
2.  **Authentication Flow**:
    - Go to **Authentication** -> **Flows**.
    - Select **First Broker Login** from the list.
    - Find the step **Confirm Link Existing Account** and set it to **Disabled**.
    - Find the step **Verify Existing Account by Email** and set it to **Disabled** (if you want fully automatic linking without an extra email loop).

> [!CAUTION]
> Disabling these checks assumes you trust your Identity Provider (Google) 100%. If an attacker compromises a Google account, they will have instant access to the linked Keycloak account without further verification.

### 🔑 Fix "Update password" or "Required Action"
If Keycloak asks the user to update their password after logging in via Google:

1.  Go to **Users** -> Click on the specific user.
2.  In the **Details** tab (or **User Profile**), find the **Required User Actions** field.
3.  Click the **X** to remove **Update Password** (and **Verify Email** if present).
4.  **Save** the changes.

> [!TIP]
> This happens if the user was created manually by an admin with the "Temporary" password flag set. Removing the action allows Google login to bypass the credential update screen.
