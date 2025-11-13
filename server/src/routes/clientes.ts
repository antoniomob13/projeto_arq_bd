import { Router } from 'express';
import { Cliente } from '../models/Cliente.js';

const r = Router();

r.get('/', async (_req, res) => {
  const items = await Cliente.find().lean();
  res.json(items);
});

r.post('/', async (req, res) => {
  const created = await Cliente.create(req.body);
  res.status(201).json(created);
});

export default r;