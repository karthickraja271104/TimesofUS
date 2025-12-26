import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import http from "http";
import { Server } from "socket.io";

import memoryRoutes from "./src/routes/memoryRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});
const __dirname = path.resolve();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Make io accessible to routes
app.set('io', io);

// Database Connection
console.log("🔄 Attempting to connect to MongoDB...");
console.log("📍 URI:", process.env.MONGODB_URI ? "Set" : "⚠️ NOT SET");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("🎉 Database ready for operations");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Socket.io for video call signaling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Store user connection and send existing users to new user
  socket.on('user-joined', (userId) => {
    connectedUsers.set(socket.id, userId);
    console.log('📝 User joined:', { socketId: socket.id, userId });
    
    // Send all currently connected users to the new user
    const existingUsers = Array.from(connectedUsers.entries())
      .filter(([sid]) => sid !== socket.id) // Don't send themselves
      .map(([socketId, peerUserId]) => ({
        socketId,
        userId: peerUserId
      }));
    
    if (existingUsers.length > 0) {
      socket.emit('existing-users', existingUsers);
      console.log('📤 Sent existing users to', socket.id, ':', existingUsers.length, 'users');
    } else {
      console.log('📋 No existing users to send to', socket.id);
    }
    
    // Notify everyone (including the new user) about this new user
    io.emit('user-online', { socketId: socket.id, userId });
    console.log('📤 Emitted user-online. Total users:', connectedUsers.size);
  });

  // Handle offer (SDP)
  socket.on('offer', (data) => {
    console.log('📨 Offer received from', socket.id, 'to', data.to);
    io.to(data.to).emit('offer', {
      from: socket.id,
      offer: data.offer,
    });
  });

  // Handle answer (SDP)
  socket.on('answer', (data) => {
    console.log('📨 Answer received from', socket.id, 'to', data.to);
    io.to(data.to).emit('answer', {
      from: socket.id,
      answer: data.answer,
    });
  });

  // Handle ICE candidates
  socket.on('ice-candidate', (data) => {
    console.log('❄️ ICE candidate from', socket.id, 'to', data.to);
    io.to(data.to).emit('ice-candidate', {
      from: socket.id,
      candidate: data.candidate,
    });
  });;

  // Handle disconnect
  socket.on('disconnect', () => {
    const userId = connectedUsers.get(socket.id);
    connectedUsers.delete(socket.id);
    io.emit('user-offline', socket.id);
    console.log('👤 User disconnected:', socket.id, '(', userId, ')');
    console.log('📊 Remaining users:', connectedUsers.size);
  });

  // Handle end call
  socket.on('end-call', () => {
    const peerId = connectedUsers.get(socket.id);
    console.log('📞 End call from', socket.id, '(Peer ID:', peerId, ')');
    
    // Broadcast to all other users that this user ended the call
    socket.broadcast.emit('call-ended', { from: peerId, fromSocketId: socket.id });
  });

  // Send current online users to newly connected user
  socket.on('request-online-users', () => {
    const onlineUsers = Array.from(connectedUsers.entries()).map(([socketId, userId]) => ({
      socketId,
      userId
    }));
    socket.emit('online-users-list', onlineUsers);
    console.log('📤 Sent online users list to', socket.id);
  });
});

// API Routes
app.use("/api/memories", memoryRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running", timestamp: new Date() });
});

// Production: Serve frontend static files
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

// Error handling middleware
app.use(errorHandler);

// 404 handler (development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
