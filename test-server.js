// Simple test server
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({success: true, message: 'API working', timestamp: new Date().toISOString()});
});

app.listen(3000, () => {
  console.log('Test server running on port 3000');
});