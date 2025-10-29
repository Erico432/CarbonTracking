# 🚀 Deployment Guide

This guide provides step-by-step instructions for deploying the Carbon Footprint Tracker application to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:

1. **MongoDB Database**: Set up a MongoDB Atlas cluster or another MongoDB hosting service
2. **Environment Variables**: Prepare your production environment variables
3. **Git Repository**: Push your code to GitHub/GitLab

## 🌐 Environment Variables Setup

Create the following environment variables in your hosting platform:

### Backend (Server) Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/carbon-footprint-tracker
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
CLIENT_URL=https://your-frontend-domain.com
```

### Frontend (Client) Environment Variables
```env
VITE_API_URL=https://your-backend-domain.com
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

#### Frontend Deployment
1. **Connect Repository**:
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `client` folder as the root directory

2. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Add Environment Variables**:
   - `VITE_API_URL`: Your backend API URL

4. **Deploy**: Click "Deploy"

#### Backend Deployment
1. **Create New Project**:
   - Click "New Project" again
   - Select the `server` folder as the root directory

2. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Add Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Your JWT secret
   - `CLIENT_URL`: Your frontend URL

4. **Deploy**: Click "Deploy"

### Option 2: Netlify

#### Frontend Deployment
1. **Connect Repository**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Set build settings:
     - **Base directory**: `client`
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`

2. **Add Environment Variables**:
   - `VITE_API_URL`: Your backend API URL

3. **Deploy**: Click "Deploy site"

#### Backend Deployment (Using Netlify Functions)
1. **Create netlify.toml** in server directory (already created)
2. **Deploy as Function**:
   - Create a new site for the backend
   - Set build settings:
     - **Base directory**: `server`
     - **Build command**: `npm install`
     - **Publish directory**: `.`
   - Add environment variables as above

### Option 3: Railway

#### Full-Stack Deployment
1. **Connect Repository**:
   - Go to [Railway](https://railway.app)
   - Click "Deploy from GitHub"
   - Connect your repository

2. **Configure Services**:
   - Railway will auto-detect your project structure
   - Set up separate services for client and server if needed

3. **Add Environment Variables**:
   - Add all required environment variables for both services

4. **Database**:
   - Use Railway's built-in MongoDB or connect to MongoDB Atlas

### Option 4: Heroku

#### Backend Deployment
1. **Create App**:
   ```bash
   heroku create your-app-name-backend
   ```

2. **Set Buildpacks**:
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

3. **Add Environment Variables**:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGO_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set CLIENT_URL=your-frontend-url
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

#### Frontend Deployment
1. **Create App**:
   ```bash
   heroku create your-app-name-frontend
   ```

2. **Set Buildpack**:
   ```bash
   heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git
   ```

3. **Add Environment Variables**:
   ```bash
   heroku config:set VITE_API_URL=your-backend-url
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🔧 Post-Deployment Configuration

### 1. Update CORS Settings
Ensure your backend allows requests from your frontend domain:

```javascript
// server/server.js
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
};
```

### 2. Update Environment Variables
- Replace `CLIENT_URL` in backend with your actual frontend URL
- Replace `VITE_API_URL` in frontend with your actual backend URL

### 3. Database Connection
- Ensure MongoDB Atlas allows connections from your hosting platform's IP ranges
- Test database connectivity after deployment

### 4. Socket.IO Configuration
For production, ensure Socket.IO is properly configured:

```javascript
// server/server.js
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});
```

## 🧪 Testing Deployment

1. **Frontend**: Visit your deployed frontend URL
2. **API**: Test API endpoints using tools like Postman
3. **Authentication**: Try registering and logging in
4. **Real-time Features**: Test Socket.IO connections
5. **Database**: Verify data is being saved and retrieved

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs for errors
   - Ensure all dependencies are listed in package.json
   - Verify Node.js version compatibility

2. **Environment Variables**:
   - Double-check variable names and values
   - Ensure variables are set at the correct scope

3. **CORS Errors**:
   - Verify CLIENT_URL matches your frontend domain
   - Check if credentials are properly configured

4. **Database Connection**:
   - Test MongoDB connection string
   - Ensure database user has proper permissions
   - Check network access rules

5. **Socket.IO Issues**:
   - Verify WebSocket support on hosting platform
   - Check firewall settings for WebSocket connections

## 📊 Performance Optimization

1. **Enable Compression**: Use gzip compression for responses
2. **CDN**: Consider using a CDN for static assets
3. **Caching**: Implement proper caching headers
4. **Database Indexing**: Ensure proper indexes on MongoDB collections

## 🔒 Security Checklist

- [ ] Environment variables are properly configured
- [ ] JWT secrets are strong and unique
- [ ] CORS is properly configured
- [ ] HTTPS is enabled
- [ ] Database credentials are secure
- [ ] Sensitive data is not logged
- [ ] Rate limiting is implemented (if needed)

## 📞 Support

If you encounter issues during deployment:

1. Check the deployment logs
2. Verify environment variables
3. Test locally with production environment variables
4. Check hosting platform documentation
5. Reach out to the community or maintainers

---

Happy deploying! 🎉
