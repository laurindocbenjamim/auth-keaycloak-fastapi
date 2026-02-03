# Keycloak Deployment Files

This directory contains the configuration files needed to deploy Keycloak to Render.

## Files

- `Dockerfile` - Optimized Keycloak image for production
- `RENDER_DEPLOYMENT.md` - Complete deployment guide

## Quick Start

1. Create PostgreSQL database on Render
2. Push this directory to your Git repository
3. Create a new Web Service on Render pointing to this directory
4. Follow the deployment guide in `RENDER_DEPLOYMENT.md`

## Environment Variables Required

```env
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=<strong-password>
KC_DB=postgres
KC_DB_URL=<postgres-internal-url>
KC_DB_USERNAME=<postgres-username>
KC_DB_PASSWORD=<postgres-password>
KC_HOSTNAME=<your-service-url>
KC_PROXY=edge
KC_HTTP_ENABLED=true
```
