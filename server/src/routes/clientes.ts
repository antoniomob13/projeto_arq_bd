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
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Já existe um cliente com este CPF/CNPJ.' });
    }
    console.error('POST /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

r.put('/:id', async (req, res) => {
  try {
    const updated = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.json(updated);
  } catch (err: any) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: 'Já existe um cliente com este CPF/CNPJ.' });
    }
    console.error('PUT /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

r.delete('/:id', async (req, res) => {
  try {
    const deleted = await Cliente.findByIdAndDelete(req.params.id).lean();
    if (!deleted) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error('DELETE /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default r;