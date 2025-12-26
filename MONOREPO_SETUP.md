# Romantic Timeline - Monorepo Setup

This project is now organized as a monorepo with separate `frontend` and `backend` folders.

## 📁 Project Structure

```
React-Animations/
├── frontend/              # React Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── backend/               # Node.js Express backend
│   ├── src/
│   ├── server.js
│   ├── package.json
│   └── ...
├── package.json          # Root package.json with monorepo scripts
└── README.md
```

## 🚀 Getting Started

### Install Dependencies

```bash
npm run install-all
```

### Development Mode (Run Both)

```bash
npm run dev
```

### Run Only Backend

```bash
npm run dev:backend
```

### Run Only Frontend

```bash
npm run dev:frontend
```

### Build for Production

```bash
npm run build
```

### Start Backend Server

```bash
npm start
```

## 📝 Available Scripts

| Script                 | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run install-all`  | Install dependencies for both frontend and backend |
| `npm run build`        | Build frontend and prepare for deployment          |
| `npm start`            | Start the backend server                           |
| `npm run dev`          | Run both frontend and backend in development mode  |
| `npm run dev:backend`  | Run only the backend server                        |
| `npm run dev:frontend` | Run only the frontend development server           |

## 🔧 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (for backend)

## 📌 Environment Variables

Create a `.env` file in the `backend` folder with your configuration:

```
MONGODB_URI=your_mongodb_uri
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

## 🎯 Next Steps

1. Move all your React source files (`src/`, `public/`) to the `frontend/src/` and `frontend/public/` folders
2. Update the backend `.env` file with your credentials
3. Run `npm run dev` to start both servers
4. Access the app at `http://localhost:5173`

## 📦 Deployment

For deployment, use:

```bash
npm run build
```

This will:

1. Install dependencies for both frontend and backend
2. Build the frontend for production
3. Create optimized bundles ready for deployment

---

**Happy coding! 💕**
