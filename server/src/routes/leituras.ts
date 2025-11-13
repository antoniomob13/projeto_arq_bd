import { Router } from 'express';
import { Leitura } from '../models/Leitura.js';

const r = Router();

r.get('/', async (_req, res) => {
  const items = await Leitura.find().lean().limit(500);
  res.json(items);
});

r.post('/', async (req, res) => {
  const created = await Leitura.create(req.body);
  res.status(201).json(created);
});

export default r;