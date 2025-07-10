const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const consentRoutes = require('./routes/consentRoutes');
const database = require('./config/database');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/consent', consentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    database: database.supabase ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Function to find an available port
const findAvailablePort = (startPort, maxAttempts = 10) => {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let attempts = 0;

    const tryPort = () => {
      if (attempts >= maxAttempts) {
        reject(new Error(`Could not find an available port after ${maxAttempts} attempts`));
        return;
      }

      const server = app.listen(currentPort, () => {
        console.log(`✅ TattSync Backend Server running on port ${currentPort}`);
        console.log(`📊 Health check available at: http://localhost:${currentPort}/api/health`);
        resolve(server);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.log(`⚠️  Port ${currentPort} is in use, trying port ${currentPort + 1}...`);
          currentPort++;
          attempts++;
          server.close();
          setTimeout(tryPort, 100);
        } else {
          reject(err);
        }
      });
    };

    tryPort();
  });
};

// Start server with port conflict handling
findAvailablePort(port)
  .then((server) => {
    // Graceful shutdown handling
    process.on('SIGTERM', () => {
      console.log('🛑 SIGTERM received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('\n🛑 SIGINT received, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err.message);
    
    if (err.message.includes('Could not find an available port')) {
      console.log('\n💡 Suggestions:');
      console.log('   1. Use the provided start scripts (start-backend.sh or start-backend.bat)');
      console.log('   2. Manually kill the process using port 3003:');
      console.log('      - Linux/Mac: lsof -i :3003 then kill -9 <PID>');
      console.log('      - Windows: netstat -ano | findstr :3003 then taskkill /PID <PID> /F');
      console.log('   3. Set a different PORT environment variable');
    }
    
    process.exit(1);
  });