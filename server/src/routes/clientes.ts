import { Router } from 'express';
import { Cliente } from '../models/Cliente.js';

const r = Router();

r.get('/', async (_req, res) => {
  try {
    const items = await Cliente.find().lean();
    res.json(items);
  } catch (err: any) {
    console.error('GET /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

r.post('/', async (req, res) => {
  try {
    console.log('POST /clientes body:', req.body);
    const created = await Cliente.create(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('POST /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default r;