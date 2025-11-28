import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/solar-db');

// Ativar todos os clientes
const result = await mongoose.connection.collection('clientes').updateMany(
  { ativo: false },
  { $set: { ativo: true } }
);

console.log(`\n✅ ${result.modifiedCount} clientes foram ativados!`);

// Mostrar alguns clientes para teste
const clientes = await mongoose.connection.collection('clientes')
  .find({ tipo: 'cliente' })
  .limit(5)
  .toArray();

console.log('\n=== CLIENTES PARA TESTE ===');
for (const c of clientes) {
  console.log(`Email: ${c.email} | Senha: 123456 | Ativo: ${c.ativo}`);
}

process.exit(0);
