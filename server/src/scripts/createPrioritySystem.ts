import 'dotenv/config';
import { connect } from '../db.js';
import { Sistema } from '../models/Sistema.js';

const TEST_SYSTEM_NAME = 'Sistema Prioritário Teste';

async function ensurePrioritySystem() {
  const basePayload = {
    nome: TEST_SYSTEM_NAME,
    localizacao: {
      latitude: -23.55052,
      longitude: -46.633308,
      rua: 'Rua Energia Solar',
      bairro: 'Consolação',
      cep: '01310-000',
    },
    subsistema: [
      {
        tipo_sistema: 'Híbrido',
        data_instalacao: new Date('2024-09-01'),
        componentes: {
          baterias: [
            {
              marca: 'BYD',
              modelo: 'B-Box LVL',
              capacidade_kWh: 13.8,
              quantidade: 2,
            },
          ],
          paineis: [
            {
              marca: 'Canadian Solar',
              modelo: 'HiKu6 555W',
              capacidade_Wp: 555,
              quantidade: 20,
            },
          ],
          inversores: [
            {
              marca: 'Sungrow',
              modelo: 'SH10RT',
            },
          ],
          controladores: [
            {
              marca: 'SMA',
              modelo: 'Sunny Island',
            },
          ],
        },
      },
    ],
    status_operacional: 'Alerta crítico',
    prioridade_teste: true,
  } as const;

  const sistema = await Sistema.findOneAndUpdate(
    { nome: TEST_SYSTEM_NAME },
    basePayload,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return sistema;
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Defina a variável MONGODB_URI antes de executar o seed.');
  }

  const connection = await connect(uri);
  try {
    const sistema = await ensurePrioritySystem();
    if (!sistema?._id) {
      throw new Error('Falha ao criar ou recuperar o sistema prioritário de teste.');
    }
    console.log('✅ Sistema prioritário de teste pronto:', sistema._id.toString());
  } finally {
    await connection.close();
  }
}

main().catch((err) => {
  console.error('❌ Erro ao criar sistema prioritário de teste:', err);
  process.exit(1);
});
