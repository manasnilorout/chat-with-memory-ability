import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import employeeRoutes from './routes/employeeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import memoryRoutes from './routes/memoryRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/employee', employeeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/memories', memoryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     Employee Task Assistant Server                         ║
╠════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                  ║
║  Health check:      http://localhost:${PORT}/health           ║
╠════════════════════════════════════════════════════════════╣
║  API Endpoints:                                            ║
║  - POST   /api/employee          Register employee         ║
║  - GET    /api/employee/:id      Get employee              ║
║  - POST   /api/chat              Send chat message         ║
║  - GET    /api/chat/history/:id  Get chat history          ║
║  - GET    /api/memories/:id      Get employee memories     ║
╚════════════════════════════════════════════════════════════╝
  `);
});
