// Script para testar a API
const http = require('http');

const url = 'http://localhost:4000/api/leituras/agregado?sistema=69289ad0b44d656589b91e5d';

http.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log('Primeiro registro:');
    console.log(JSON.stringify(json.dados[0], null, 2));
    
    console.log('\nCampos presentes:');
    console.log(Object.keys(json.dados[0]));
  });
}).on('error', err => {
  console.error('Erro:', err.message);
});
