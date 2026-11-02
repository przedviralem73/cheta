import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import coupleRoutes from './routes/couple.js';
import wishlistRoutes from './routes/wishlist.js';

dotenv.config();

// BigInt serialization fix для JSON
(BigInt.prototype as any).toJSON = function() {
  return this.toString();
};

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/couple', coupleRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
