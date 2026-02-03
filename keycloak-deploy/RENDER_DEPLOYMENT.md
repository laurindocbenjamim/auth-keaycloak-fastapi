# Keycloak Deployment Guide for Render

## Prerequisites
- Render account (https://render.com)
- Local Keycloak realm exported
- Git repository with Keycloak configuration

## Step 1: Create PostgreSQL Database on Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** → Select **"PostgreSQL"**
3. **Configure Database**:
   - Name: `keycloak-db`
   - Database: `keycloak`
   - User: `keycloak_user` (auto-generated)
   - Region: Choose closest to your users
   - Instance Type: **Free** (for testing) or **Starter** (for production)
4. **Click "Create Database"**
5. **Save the Internal Database URL** (e.g., `postgresql://user:pass@host/keycloak`)

## Step 2: Push Keycloak Configuration to Git

From your project directory:

```bash
cd /home/feti/Documents/PythonProjects/auth-keaycloak-fastapi
git add keycloak-deploy/
git commit -m "Add Keycloak Render configuration"
git push origin dev
```

## Step 3: Create Keycloak Web Service on Render

1. **Go to Render Dashboard** → **Click "New +"** → **"Web Service"**
2. **Connect your Git repository**
3. **Configure the service**:
   - **Name**: `elinara-keycloak`
   - **Region**: Same as your database
   - **Branch**: `dev` (or your main branch)
   - **Root Directory**: `keycloak-deploy`
   - **Runtime**: **Docker**
   - **Instance Type**: **Free** (for testing) or **Starter** ($7/mo)

4. **Add Environment Variables** (click "Advanced"):

```env
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<create-strong-password>
KC_DB=postgres
KC_DB_URL=<paste-internal-database-url-from-step-1>
KC_DB_USERNAME=keycloak_user
KC_DB_PASSWORD=<database-password-from-step-1>
KC_HOSTNAME=<leave-empty-for-now>
KC_PROXY=edge
KC_HTTP_ENABLED=true
```

5. **Click "Create Web Service"**
6. **Wait for deployment** (~5-10 minutes)
7. **Copy the public URL** (e.g., `https://elinara-keycloak.onrender.com`)

## Step 4: Update KC_HOSTNAME Environment Variable

1. **Go back to your Keycloak service** on Render
2. **Environment tab**
3. **Update `KC_HOSTNAME`**:
   ```
   KC_HOSTNAME=elinara-keycloak.onrender.com
   ```
4. **Save** (this will trigger a redeploy)

## Step 5: Access Keycloak Admin Console

1. **Navigate to**: `https://elinara-keycloak.onrender.com`
2. **Click "Administration Console"**
3. **Login with**:
   - Username: `admin`
   - Password: `<your-admin-password-from-step-3>`

## Step 6: Export Local Realm Configuration

On your local machine:

```bash
# Access your local Keycloak container
docker exec -it auth-keaycloak-fastapi-keycloak-1 /bin/bash

# Export the realm
/opt/keycloak/bin/kc.sh export --dir /tmp/export --realm elinara-realm

# Exit container
exit

# Copy the exported file to your host
docker cp auth-keaycloak-fastapi-keycloak-1:/tmp/export/elinara-realm-realm.json ./keycloak-export.json
```

## Step 7: Import Realm to Production Keycloak

1. **Open production Keycloak Admin Console**
2. **Hover over realm dropdown** (top left) → **Click "Create Realm"**
3. **Click "Browse"** and upload `keycloak-export.json`
4. **Click "Create"**

> **Important**: After import, you need to update redirect URIs:
> - Go to **Clients** → **elinara-frontend**
> - Update **Valid Redirect URIs** to include your Render frontend URL
> - Update **Valid Post Logout Redirect URIs** to include your Render frontend URL
> - Update **Web Origins** to include your Render frontend URL

## Step 8: Update Backend Environment Variables on Render

1. **Go to your backend service** on Render dashboard
2. **Environment tab** → **Add variables**:
   ```env
   KEYCLOAK_URL=https://elinara-keycloak.onrender.com
   KEYCLOAK_REALM=elinara-realm
   KEYCLOAK_CLIENT_ID=elinara-backend
   KEYCLOAK_CLIENT_SECRET=<your-client-secret-from-keycloak>
   ```
3. **Save** (triggers redeploy)

## Step 9: Update Frontend Keycloak Configuration

Update `auth-frontend/src/keycloak.js`:

```javascript
const keycloak = new Keycloak({
    url: 'https://elinara-keycloak.onrender.com',
    realm: 'elinara-realm',
    clientId: 'elinara-frontend'
});
```

Then deploy your frontend to Render or your hosting platform.

## Step 10: Update Keycloak Client Settings

In production Keycloak Admin Console:

1. **Clients** → **elinara-frontend**
2. **Update URLs**:
   - Valid Redirect URIs: `https://<your-frontend-url>/*`
   - Valid Post Logout Redirect URIs: `https://<your-frontend-url>/*`
   - Web Origins: `https://<your-frontend-url>`
   - Admin URL: `https://<your-frontend-url>`

3. **Clients** → **elinara-backend** (backend)
4. **Credentials tab** → **Copy Client Secret**
5. **Update backend environment variable** with this secret

## Troubleshooting

### Keycloak won't start
- Check database connection in environment variables
- Verify `KC_DB_URL` uses internal database URL (starts with `postgresql://`)
- Check logs in Render dashboard

### Database connection errors
- Ensure PostgreSQL database is running
- Verify database credentials match
- Check if database and Keycloak service are in the same region

### Frontend can't connect
- Verify CORS settings in Keycloak
- Check redirect URIs include your frontend URL
- Ensure Keycloak URL is publicly accessible

## Cost Estimate (Render)

- **Free Tier**:
  - PostgreSQL: Free (expires after 90 days, 1GB limit)
  - Keycloak: Free (spins down after inactivity)
  - ⚠️ Not recommended for production

- **Production Ready**:
  - PostgreSQL Starter: $7/month
  - Keycloak Starter: $7/month
  - **Total**: ~$14/month

## Security Recommendations

1. **Use strong admin password**
2. **Enable 2FA** for Keycloak admin
3. **Regular backups** of PostgreSQL database
4. **Use HTTPS only** (Render provides this automatically)
5. **Keep Keycloak updated** (rebuild with latest image periodically)
