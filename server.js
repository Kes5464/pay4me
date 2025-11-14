// Simple Express server for testing
console.log('Starting server...');
import express from 'express';
import cors from 'cors';

console.log('Imports loaded...');
const app = express();
const PORT = process.env.PORT || 3001;

console.log('Setting up middleware...');
app.use(cors());
app.use(express.json());

console.log('Setting up routes...');
app.get('/api/health', (req, res) => {
  console.log('Health endpoint called');
  res.json({
    success: true,
    message: 'Pay4me API is running',
    timestamp: new Date().toISOString()
  });
});

console.log(`Starting server on port ${PORT}...`);
app.listen(PORT, () => {
  console.log(`Pay4me API server running on port ${PORT}`);
});