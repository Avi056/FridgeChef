# FridgeChef

FridgeChef is a production-ready full-stack web app for tracking fridge ingredients and finding recipes from them. It uses Google OAuth, Pinecone, Express, React, Vite, Tailwind CSS, Framer Motion, and Spoonacular.

## Features

- Google OAuth sign-in with protected app routes
- Pinecone-backed users, per-user fridge ingredients, cached recipe metadata, and favorites
- Animated refrigerator UI with add/remove ingredient flows
- Dynamic recipe search by available ingredients
- Meal type and complexity filters
- Pantry score, cookable-only mode, favorites, loading states, and polished responsive UI

## Project Structure

```text
FridgeChef/
  client/      React + Vite frontend
  server/      Express + Pinecone backend
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

3. Fill in `server/.env` for local development:

```bash
PORT=5001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SESSION_SECRET=replace-with-a-long-random-string
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5001/auth/google/callback
SPOONACULAR_API_KEY=your-spoonacular-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_INDEX_NAME=fridgechef
PINECONE_HOST=https://your-index-host.svc.region.pinecone.io
```

4. Fill in `client/.env` for local development:

```bash
VITE_API_URL=http://localhost:5001
```

5. Set up production values for Netlify + Render backend hosting:

```bash
CLIENT_URL=https://fridgecraft.netlify.app
GOOGLE_CALLBACK_URL=YOURVITEAPIURLHERE/auth/google/callback
```

6. Configure Google OAuth:

- Local development:
  - Authorized JavaScript origin: `http://localhost:5173`
  - Authorized redirect URI: `http://localhost:5001/auth/google/callback`
- Production (Netlify frontend + Render backend):
  - Authorized JavaScript origin: `https://fridgecraft.netlify.app`
  - Authorized redirect URI: `YOUR_RENDER_BACKEND_URL/auth/google/callback`

> Important: do not set the Google callback URI to a Netlify frontend URL. It must point to the Render backend route that handles OAuth.

7. Run the app locally:

```bash
npm run dev
```

Local frontend: `http://localhost:5173`

Local backend: `http://localhost:5001`

## Netlify production deployment

If you deploy the frontend to Netlify and the backend is hosted on Render, keep the backend URL in a Netlify environment variable.

- Build command: `npm install && npm run build --workspace client`
- Publish directory: `client/dist`
- Redirects: use `netlify.toml` to send all routes to `index.html`
- Add this environment variable on Netlify:
  - `VITE_API_URL=your-vite-api-url-here`

Then update your backend's production environment values:

- `CLIENT_URL=https://fridgecraft.netlify.app`
- `GOOGLE_CALLBACK_URL=YOUR_RENDER_BACKEND_URL/auth/google/callback`

## Render deployment for backend

The Express backend must be deployed to Render (or similar hosting). Set these environment variables on Render:

**Essential for OAuth & CORS:**
- `CLIENT_URL=https://fridgecraft.netlify.app` (required so CORS allows your Netlify frontend)
- `GOOGLE_CALLBACK_URL=YOURVITEAPIURLHERE/auth/google/callback` (required for OAuth redirect)
- `NODE_ENV=production` (enables secure cookies)

**Authentication & APIs:**
- `SESSION_SECRET=replace-with-a-long-random-string`
- `GOOGLE_CLIENT_ID=your-google-client-id`
- `GOOGLE_CLIENT_SECRET=your-google-client-secret`
- `SPOONACULAR_API_KEY=your-spoonacular-api-key`

**Pinecone:**
- `PINECONE_API_KEY=your-pinecone-api-key`
- `PINECONE_INDEX_NAME=fridgechef`
- `PINECONE_HOST=https://your-index-host.svc.region.pinecone.io`

**After deployment, test:**
- Call `YOURVITEAPIURLHERE/health` to verify the backend is running
- Make sure Google OAuth URLs are authorized (see OAuth configuration below)

## API

### Auth

- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/logout`
- `GET /auth/me`

### Fridge

- `GET /api/fridge`
- `POST /api/fridge/add-ingredient`
- `DELETE /api/fridge/remove-ingredient/:ingredientId`

### Recipes

- `POST /api/recipes/search`
- `GET /api/recipes/favorites`
- `POST /api/recipes/favorites`
- `DELETE /api/recipes/favorites/:recipeId`

## Recipe API

The backend uses Spoonacular's `findByIngredients` endpoint, then enriches results with recipe information. If `SPOONACULAR_API_KEY` is missing, the endpoint returns deterministic mock recipes so the UI remains usable during local development.

## Production Notes

- Set `NODE_ENV=production` and use HTTPS so secure cross-site session cookies work correctly.
- Configure `CLIENT_URL` to your deployed frontend origin.
- Store secrets in your platform secret manager, not in committed files.
- Add the deployed backend callback URL to Google OAuth before release.
