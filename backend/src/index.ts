import express from 'express';
import cors from 'cors';
import { CampusEnergySimulator } from './simulator/energySimulator.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const simulator = new CampusEnergySimulator();

// 1. Campus Status & Telemetry
app.get('/api/campus-status', (_req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    blocks: simulator.getStatus(),
  });
});

// 2. Resolve Leak Endpoint (Triggered when user hits 'Cut Off Load')
app.post('/api/resolve-leak', (req, res) => {
  const { blockId } = req.body;
  if (!blockId) {
    res.status(400).json({ error: 'blockId is required' });
    return;
  }
  const success = simulator.resolveLeak(blockId);
  res.json({ success, message: success ? 'Leak resolved & energy load shut off' : 'Block not found' });
});

// 3. Department Leaderboard
app.get('/api/leaderboard', (_req, res) => {
  res.json([
    { rank: 1, department: 'Computer Science & Engg', greenCredits: 4250, kwhSaved: 340, streakDays: 12 },
    { rank: 2, department: 'Mechanical Engineering', greenCredits: 3890, kwhSaved: 295, streakDays: 8 },
    { rank: 3, department: 'Civil Engineering', greenCredits: 3120, kwhSaved: 210, streakDays: 5 },
    { rank: 4, department: 'Electronics & Comm (ECE)', greenCredits: 2840, kwhSaved: 180, streakDays: 4 },
  ]);
});

app.listen(PORT, () => {
  console.log(`[EcoPulse Backend] running on http://localhost:${PORT}`);
});
