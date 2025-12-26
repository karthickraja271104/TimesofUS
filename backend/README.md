# Romantic Timeline Backend API

Complete backend for the romantic couples timeline application with MongoDB, Cloudinary, and Express.js.

## 📋 Setup Instructions

### 1. Create MongoDB Atlas Account

- Go to [mongodb.com/cloud](https://www.mongodb.com/cloud/atlas)
- Create a free cluster
- Get your connection string
- Create `.env` file with your MongoDB URI

### 2. Create Cloudinary Account

- Go to [cloudinary.com](https://cloudinary.com)
- Sign up for free (supports up to 25GB storage)
- Get your credentials:
  - Cloud Name
  - API Key
  - API Secret
- Add to `.env` file

### 3. Environment Setup

```bash
# Copy example file
cp .env.example .env

# Fill in your credentials in .env:
MONGODB_URI=your_mongodb_atlas_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Server

```bash
# Development with nodemon
npm run dev

# Production
npm start
```

Server runs on: `http://localhost:5000`

## 🔌 API Endpoints

### Create Memory

```http
POST /api/memories
Content-Type: multipart/form-data

Fields:
- title (string, required)
- message (string, required)
- date (ISO date string, required)
- media (file, optional)
```

**Response:**

```json
{
  "success": true,
  "message": "Memory created successfully",
  "data": {
    "id": "...",
    "title": "Our First Date",
    "message": "...",
    "date": "2024-12-24",
    "media": {
      "type": "image",
      "url": "https://res.cloudinary.com/...",
      "publicId": "memories/..."
    },
    "createdAt": "..."
  }
}
```

### Get All Memories

```http
GET /api/memories
```

**Response:**

```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

### Get Memory by ID

```http
GET /api/memories/:id
```

### Update Memory

```http
PUT /api/memories/:id
Content-Type: multipart/form-data

Fields: same as create (all optional)
```

### Delete Memory

```http
DELETE /api/memories/:id
```

## 📦 File Size Limits

- Images: 5MB
- Videos: 20MB
- Audio: 10MB

## 🎯 Supported Media Types

- **Images:** jpg, png, webp
- **Videos:** mp4, webm
- **Audio:** mp3, wav, m4a

## 🔒 Security Features

- CORS enabled for frontend communication
- Request validation and error handling
- Cloudinary automatic file type detection
- Secure file storage with public IDs
- Request body size limit: 50MB

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/        # Cloudinary configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Upload & error handling
│   ├── models/         # MongoDB schemas
│   └── routes/         # API endpoints
├── server.js           # Express app setup
├── package.json
└── .env               # Environment variables
```
