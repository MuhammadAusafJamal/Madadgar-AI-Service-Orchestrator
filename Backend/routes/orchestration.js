import express from 'express';
import { Orchestrator } from '../workflows/orchestrator.js';

const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }

  const result = await Orchestrator.processRequest(message, history);
  
  return res.json(result);
});

export default router;
