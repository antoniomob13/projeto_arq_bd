import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/solar-db');
const clientes = await mongoose.connection.collection('clientes').find({}).limit(5).toArray();

console.log('\n=== USUARIOS NO BANCO ===');
for (const c of clientes) {
  console.log(`Email: ${c.email}`);
  console.log(`Senha: ${c.senha}`);
  console.log(`Tipo: ${c.tipo}`);
  console.log('---');
}

process.exit(0);
