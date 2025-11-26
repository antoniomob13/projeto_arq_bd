import { Router } from 'express';
import { Cliente } from '../models/Cliente.js';

const r = Router();

// Listar todos os clientes
r.get('/', async (_req, res) => {
  try {
    const items = await Cliente.find().populate('sistema_id', 'nome status_operacional').lean();
    res.json(items);
  } catch (err: any) {
    console.error('GET /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Buscar cliente por ID
r.get('/:id', async (req, res) => {
  try {
    const item = await Cliente.findById(req.params.id).populate('sistema_id').lean();
    if (!item) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }
    res.json(item);
  } catch (err: any) {
    console.error('GET /clientes/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Criar novo cliente
r.post('/', async (req, res) => {
  try {
    const created = await Cliente.create(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    console.error('POST /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Atualizar cliente
r.put('/:id', async (req, res) => {
  try {
    const updated = await Cliente.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }
    res.json(updated);
  } catch (err: any) {
    console.error('PUT /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Deletar cliente
r.delete('/:id', async (req, res) => {
  try {
    const deleted = await Cliente.findByIdAndDelete(req.params.id).lean();
    if (!deleted) {
      return res.status(404).json({ error: 'Cliente nao encontrado' });
    }
    res.status(204).send();
  } catch (err: any) {
    console.error('DELETE /clientes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Login
r.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const cliente = await Cliente.findOne({ email: email.toLowerCase().trim() }).populate('sistema_id').lean();
    
    if (!cliente || cliente.senha !== senha) {
      return res.status(401).json({ error: 'Credenciais invalidas' });
    }
    
    if (!cliente.ativo) {
      return res.status(403).json({ error: 'Usuario desativado' });
    }
    
    // Retorna o cliente sem a senha
    const { senha: _, ...clienteSemSenha } = cliente;
    res.json(clienteSemSenha);
  } catch (err: any) {
    console.error('POST /clientes/login error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default r;
