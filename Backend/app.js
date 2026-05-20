import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orchestrationRoutes from './routes/orchestration.js';
import emailRoutes from './routes/email.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'AI Service Orchestrator Backend' });
});

// Routes
app.use('/api/orchestration', orchestrationRoutes);
app.use('/api/email', emailRoutes);

export default app;
