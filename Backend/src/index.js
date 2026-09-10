const express = require('express');
const cors = require('cors');
const path = require('path');
const { env } = require('./config/env');
const prisma = require('./config/db');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const mineRoutes = require('./routes/mine.routes');
const complianceRoutes = require('./routes/compliance.routes');
const inspectionRoutes = require('./routes/inspection.routes');
const violationRoutes = require('./routes/violation.routes');
const uploadRoutes = require('./routes/upload.routes');
const chatRoutes = require('./routes/chat.routes');
const documentRoutes = require('./routes/document.routes');

const app = express();

// ==========================================
// Middlewares
// ==========================================
app.use(
  cors({
    origin: env.CLIENT_ORIGIN === '*' ? '*' : env.CLIENT_ORIGIN.split(','),
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded documents statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// Health & Root Routes
// ==========================================
app.get('/health', async (_req, res) => {
  try {
    // DB connectivity check
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'CoalGov API',
    version: '1.3.0',
    description: 'Governance and compliance platform for Indian coal mining operations',
    modules: [
      { path: '/api/auth', description: 'Authentication & Session Management' },
      { path: '/api/mines', description: 'Mine Site & Subsidiary Directory' },
      { path: '/api/compliances', description: 'Statutory Compliance Tracking' },
      { path: '/api/inspections', description: 'Geo-Tagged Field Inspections & Authority Reports' },
      { path: '/api/violations', description: 'Violations, Show-Cause Notices & Mine Response Lifecycle' },
      { path: '/api/uploads', description: 'PDF Documents & Evidence File Uploads' },
    ],
    staticUploads: '/uploads',
  });
});

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/mines', mineRoutes);
app.use('/api/compliances', complianceRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/violations', violationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api', chatRoutes);
app.use('/api/documents', documentRoutes);

// ==========================================
// 404 Handler
// ==========================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
});

// ==========================================
// Global Error Handler
// ==========================================
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==========================================
// Server Start
// ==========================================
const PORT = parseInt(env.PORT, 10) || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 CoalGov Backend running on port ${PORT} [${env.NODE_ENV}]`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📑 API modules loaded: /auth, /mines, /compliances, /inspections, /violations, /uploads`);
  console.log(`📁 Static files hosted at: http://localhost:${PORT}/uploads`);
});

// Graceful Shutdown
const handleShutdown = async () => {
  console.log('\n🛑 Gracefully shutting down...');
  server.close(async () => {
    console.log('HTTP server closed.');
    await prisma.$disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  });
};

process.on('SIGINT', handleShutdown);
process.on('SIGTERM', handleShutdown);

module.exports = app;
