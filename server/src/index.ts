import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connect } from './db.js';
import clientes from './routes/clientes.js';
import sistemas from './routes/sistemas.js';
import leituras from './routes/leituras.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/clientes', clientes);
app.use('/api/sistemas', sistemas);
app.use('/api/leituras', leituras);

const PORT = process.env.PORT || 4000;

connect(process.env.MONGODB_URI || '')
  .then(() => {
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection error:', err.message);
    process.exit(1);
  });