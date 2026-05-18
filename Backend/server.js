import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import orchestrationRoutes from './routes/orchestration.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orchestration', orchestrationRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
