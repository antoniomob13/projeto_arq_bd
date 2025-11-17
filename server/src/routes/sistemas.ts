import { Router } from 'express';
import { Sistema } from '../models/Sistema.js';

const r = Router();

r.get('/', async (_req, res) => {
  try {
    const items = await Sistema.find().lean();
    res.json(items);
  } catch (err: any) {
    console.error('GET /sistemas error:', err);
    res.status(500).json({ error: err.message });
  }
});

r.post('/', async (req, res) => {
  try {
    const created = await Sistema.create(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('POST /sistemas error:', err);
    res.status(500).json({ error: err.message });
  }
});

r.put('/:id', async (req, res) => {
  try {
    const updated = await Sistema.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      return res.status(404).json({ error: 'Sistema não encontrado' });
    }
    res.json(updated);
  } catch (err: any) {
    console.error('PUT /sistemas error:', err);
    res.status(500).json({ error: err.message });
  }
});

r.delete('/:id', async (req, res) => {
  try {
    const deleted = await Sistema.findByIdAndDelete(req.params.id).lean();
    if (!deleted) {
      return res.status(404).json({ error: 'Sistema não encontrado' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error('DELETE /sistemas error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default r;