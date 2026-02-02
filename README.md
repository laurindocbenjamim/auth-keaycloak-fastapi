# Elinara Auth - Separated Architecture

This project is now structured to run the **Backend** and **Frontend** as completely independent services, allowing you to host them on different servers.

## Project Layout

- `auth-backend/`: Modular FastAPI application (`app/` package).
  - `app/api/`: API Routers (Auth, Users).
  - `app/core/`: Configuration and Keycloak settings.
  - `app/db/` & `app/models/`: SQLite storage logic.
- `auth-frontend/`: Premium glassmorphism React/Vite dashboard.

---

## 1. Backend & Infrastructure (`auth-backend`)

The backend follows a **Modular Architecture** for scalability.

1. **Setup**:
   ```bash
   cd auth-backend
   # Build and start services
   sudo docker compose build --no-cache && sudo docker compose up -d
   ```
2. **Access**:
   - Backend API: `http://localhost:8000`
   - Keycloak: `http://localhost:8080/admin`
3. **User Management**:
   The backend automatically synchronizes Keycloak users to a local SQLite database (`users.db`) via the `/users/sync` endpoint.

---

## 2. Frontend Application (`auth-frontend`)

The frontend is a standalone Vite app with a modern **Glassmorphism Redesign**.

- **User Directory**: View all synchronized users in a centralized table.
- **Top Bar**: Personal navigation featuring user avatar and real-time identity data.
- **Left Sidebar**: Ergonomic navigation menu.

1. **Local Development**:
   ```bash
   cd auth-frontend
   npm install && npm run dev
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
| **Backend 404** | Route mismatch | Use `/protected` for testing gateway connectivity. |
| **Import Error** | Deep relative imports | Use `...` to reference the root in modular structures. |
| **Missing Phone/Addr** | Client ID mismatch | Add mappers specifically to `elinara-frontend` client. |
| **Keycloak WARN** | XA Recovery disabled | Set `KC_TRANSACTION_MANAGER_ENABLE_RECOVERY=true`. |
| **401 Unauthorized** | Client Authentication ON | Set **Client Authentication** to **OFF** for frontend client. |
| **CORS Error** | Origin mismatch | Update `allow_origins` in `app/main.py`. |

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
