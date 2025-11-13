import { Router } from 'express';
import { Sistema } from '../models/Sistema.js';

const r = Router();

r.get('/', async (_req, res) => {
  const items = await Sistema.find().lean();
  res.json(items);
});

r.post('/', async (req, res) => {
  const created = await Sistema.create(req.body);
  res.status(201).json(created);
});

export default r;