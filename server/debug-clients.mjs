import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/solar-db');

// Verificar clientes e seus sistemas
const clientes = await mongoose.connection.collection('clientes')
  .find({ tipo: 'cliente' })
  .limit(5)
  .toArray();

console.log('\n=== CLIENTES E SEUS SISTEMAS ===');
for (const c of clientes) {
  console.log(`Email: ${c.email}`);
  console.log(`Sistema ID: ${c.sistema_id}`);
  
  if (c.sistema_id) {
    const sistema = await mongoose.connection.collection('sistemas')
      .findOne({ _id: c.sistema_id });
    console.log(`Sistema Nome: ${sistema ? sistema.nome : 'NAO ENCONTRADO!'}`);
  } else {
    console.log('Sistema: NENHUM VINCULADO');
  }
  console.log('---');
}

// Verificar se existem sistemas
const totalSistemas = await mongoose.connection.collection('sistemas').countDocuments();
console.log(`\nTotal de sistemas no banco: ${totalSistemas}`);

process.exit(0);
