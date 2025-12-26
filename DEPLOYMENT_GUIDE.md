# Deployment Guide - TimeOfUs

This guide covers deploying TimeOfUs with:
- **Frontend**: Render Static Site
- **Backend**: Render Web Service

## Prerequisites

- GitHub account with TimeOfUs repo
- Render.com account
- MongoDB Atlas account (already configured)
- Cloudinary account (already configured)

---

## Part 1: Deploy Backend Web Service

### Step 1: Create Backend Service on Render

1. Go to [render.com](https://render.com) and sign in
2. Click **New +** → **Web Service**
3. Select your GitHub repo (karthickraja271104/TimesofUS)
4. Configure:
   - **Name**: `timesofus-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Click **Create Web Service**

### Step 2: Add Environment Variables to Backend

In Render dashboard, go to **Environment** and add:

```
MONGODB_URI=mongodb+srv://kr846779:GyGKijAPZidByXfo@cluster0.8b4fmfq.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0

CLOUDINARY_CLOUD_NAME=dr5tphov0
CLOUDINARY_API_KEY=497475342284586
CLOUDINARY_API_SECRET=V_GPe5u8liCjzMmw_O6_EjGGjCE

PORT=5000
NODE_ENV=production

FRONTEND_URL=https://your-frontend-name.onrender.com
```

⚠️ **IMPORTANT**: Replace `FRONTEND_URL` with your actual frontend Static Site URL (you'll get this in Part 2)

### Step 3: Wait for Backend to Deploy

- Monitor the logs until you see "Server running on port 5000"
- Copy your backend URL: `https://timesofus-backend.onrender.com` (or your custom name)

---

## Part 2: Deploy Frontend Static Site

### Step 1: Create Frontend Static Site on Render

1. Go to Render dashboard
2. Click **New +** → **Static Site**
3. Select your GitHub repo (karthickraja271104/TimesofUS)
4. Configure:
   - **Name**: `timesofus-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
5. Click **Create Static Site**

### Step 2: Add Environment Variables to Frontend

In Render dashboard, go to **Environment** and add:

```
VITE_API_URL=https://timesofus-backend.onrender.com/api
VITE_API_DEV_URL=https://timesofus-backend.onrender.com
```

Replace `timesofus-backend` with your actual backend service name

### Step 3: Wait for Frontend to Build and Deploy

- Monitor build logs
- Once deployed, copy your frontend URL: `https://timesofus-frontend.onrender.com`

---

## Part 3: Update Backend with Frontend URL

### Go Back to Backend Service

1. In Render dashboard, open your backend service
2. Go to **Environment**
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://timesofus-frontend.onrender.com
   ```
4. Click **Save**
5. Service will redeploy automatically

---

## Part 4: Verify Deployment

### Test Backend

```bash
curl https://timesofus-backend.onrender.com/api/memories
```

Should return JSON response (not an error)

### Test Frontend

1. Visit `https://timesofus-frontend.onrender.com`
2. Check browser console (F12) for any errors
3. Try creating a memory - should work without errors

### Check CORS

If frontend can't talk to backend:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Trigger an action (create memory, fetch memories)
4. Check for CORS errors in red
5. If issue, verify `FRONTEND_URL` in backend matches exactly

---

## Troubleshooting

### "Failed to fetch memories" Error

**Issue**: Frontend can't reach backend API

**Solutions**:
1. Verify `VITE_API_URL` in frontend environment matches backend URL
2. Check backend `FRONTEND_URL` matches frontend URL exactly
3. Wait 1-2 minutes after deployment for DNS to propagate
4. Check backend service logs for connection errors

### "Could not resolve entry module" Error

**Issue**: Build failed during Static Site deployment

**Solution**: 
- Ensure `frontend` directory has `index.html` at root (not in `src/`)
- Verify vite.config.js has `root: '.'`

### Socket.io Connection Issues

**Issue**: Real-time features not working

**Solutions**:
1. Check that `FRONTEND_URL` in backend environment is correct
2. Check browser console for WebSocket errors
3. Verify both services are fully deployed

### Media Upload Fails

**Issue**: Cloudinary image/video uploads fail

**Solutions**:
1. Verify Cloudinary credentials in backend environment
2. Check file size limits (50MB max in code)
3. Check browser console for CORS errors on Cloudinary

---

## Local Development

### Setup `.env` files

```bash
# backend/.env
MONGODB_URI=mongodb+srv://kr846779:GyGKijAPZidByXfo@cluster0.8b4fmfq.mongodb.net/chatapp?retryWrites=true&w=majority&appName=Cluster0
CLOUDINARY_CLOUD_NAME=dr5tphov0
CLOUDINARY_API_KEY=497475342284586
CLOUDINARY_API_SECRET=V_GPe5u8liCjzMmw_O6_EjGGjCE
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

```bash
# frontend/.env.local
VITE_API_URL=http://localhost:5000/api
VITE_API_DEV_URL=http://localhost:5000
```

### Run Locally

```bash
# In root directory
npm run dev

# Or separately
npm run dev:backend
npm run dev:frontend
```

---

## Security Checklist

- [ ] Never commit `.env` files (use `.env.example` only)
- [ ] Use Render environment variables for sensitive data
- [ ] Set `NODE_ENV=production` in backend
- [ ] Use HTTPS URLs for CORS origins
- [ ] Verify MONGODB_URI has correct IP whitelist on Atlas
- [ ] Rotate Cloudinary API keys if exposed

---

## Performance Tips

- Frontend is served as static files (very fast)
- Backend uses Node.js runtime (scales independently)
- Use Render's Redis (paid feature) for real-time optimizations
- Monitor backend logs for slow database queries

---

## Need Help?

Check logs in Render dashboard:
- Static Site logs: View build and deployment logs
- Web Service logs: Real-time server output

Common Render docs:
- https://render.com/docs/static-sites
- https://render.com/docs/web-services
- https://render.com/docs/environment-variables
