import mongoose from 'mongoose';
import { Sistema } from '../models/Sistema.js';
import { Cliente } from '../models/Cliente.js';
import { Leitura } from '../models/Leitura.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solar-db';

// Dados iniciais de sistemas
const sistemasData = [
  {
    nome: 'Unidade Tapajós 01',
    status_operacional: 'Online',
    localizacao: {
      latitude: -2.4312,
      longitude: -54.7282,
      rua: 'Rua Vera Paz, Campus Tapajós',
      bairro: 'Salé',
      cep: '68040-000',
    },
    subsistema: [{
      tipo_sistema: 'Híbrido',
      data_instalacao: new Date('2024-01-15'),
      componentes: {
        baterias: [{ marca: 'Freedom', modelo: 'DF2500', capacidade_kWh: 2.5, quantidade: 4 }],
        paineis: [{ marca: 'Canadian Solar', modelo: 'CS6K-300MS', capacidade_Wp: 300, quantidade: 10 }],
        inversores: [{ marca: 'Growatt', modelo: 'SPF 5000ES' }],
        controladores: [{ marca: 'Victron', modelo: 'SmartSolar MPPT 150/100' }],
      },
    }],
  },
  {
    nome: 'Unidade Amazônia 02',
    status_operacional: 'Online',
    localizacao: {
      latitude: -2.4420,
      longitude: -54.7150,
      rua: 'Av. Marechal Rondon, 100',
      bairro: 'Caranazal',
      cep: '68040-070',
    },
    subsistema: [{
      tipo_sistema: 'On-Grid',
      data_instalacao: new Date('2024-02-20'),
      componentes: {
        baterias: [],
        paineis: [{ marca: 'Trina Solar', modelo: 'TSM-DE08M.08', capacidade_Wp: 400, quantidade: 15 }],
        inversores: [{ marca: 'Fronius', modelo: 'Primo 6.0' }],
        controladores: [],
      },
    }],
  },
  {
    nome: 'Unidade Oriximiná 03',
    status_operacional: 'Offline',
    localizacao: {
      latitude: -1.7633,
      longitude: -55.8539,
      rua: 'Comunidade Ribeirinha',
      bairro: 'Zona Rural',
      cep: '68270-000',
    },
    subsistema: [{
      tipo_sistema: 'Off-Grid',
      data_instalacao: new Date('2024-03-10'),
      componentes: {
        baterias: [{ marca: 'Moura Clean', modelo: 'MF220Ah', capacidade_kWh: 2.64, quantidade: 8 }],
        paineis: [{ marca: 'Risen', modelo: 'RSM144-6-400M', capacidade_Wp: 400, quantidade: 8 }],
        inversores: [{ marca: 'Deye', modelo: 'SUN-5K-SG03LP1' }],
        controladores: [{ marca: 'EPSolar', modelo: 'Tracer 6415AN' }],
      },
    }],
  },
  {
    nome: 'Unidade Belterra 04',
    status_operacional: 'Alerta/Erro',
    localizacao: {
      latitude: -2.6369,
      longitude: -54.9369,
      rua: 'Estrada do Tapajós, Km 30',
      bairro: 'Zona Rural',
      cep: '68143-000',
    },
    subsistema: [{
      tipo_sistema: 'Híbrido',
      data_instalacao: new Date('2024-04-05'),
      componentes: {
        baterias: [{ marca: 'Heliar', modelo: 'HT12-200', capacidade_kWh: 2.4, quantidade: 6 }],
        paineis: [{ marca: 'JA Solar', modelo: 'JAM72S20-455MR', capacidade_Wp: 455, quantidade: 12 }],
        inversores: [{ marca: 'Solis', modelo: 'RAI-3K-48ES-5G' }],
        controladores: [{ marca: 'Victron', modelo: 'SmartSolar MPPT 250/70' }],
      },
    }],
  },
  {
    nome: 'Unidade Alter do Chão',
    status_operacional: 'Online',
    localizacao: {
      latitude: -2.5014,
      longitude: -54.9525,
      rua: 'Praça 7 de Setembro',
      bairro: 'Centro',
      cep: '68109-000',
    },
    subsistema: [{
      tipo_sistema: 'Híbrido',
      data_instalacao: new Date('2024-05-01'),
      componentes: {
        baterias: [{ marca: 'Freedom', modelo: 'DF3000', capacidade_kWh: 3.0, quantidade: 4 }],
        paineis: [{ marca: 'Canadian Solar', modelo: 'CS6K-350MS', capacidade_Wp: 350, quantidade: 12 }],
        inversores: [{ marca: 'Growatt', modelo: 'SPF 5000ES' }],
        controladores: [{ marca: 'Victron', modelo: 'SmartSolar MPPT 150/100' }],
      },
    }],
  },
];

// Dados iniciais de clientes
const clientesData = [
  {
    nome: 'Administrador LABER',
    email: 'admin@laber.ufopa.br',
    senha: 'admin123',
    tipo: 'admin' as const,
    telefone: '(93) 99999-0000',
    endereco: {
      rua: 'Rua Vera Paz, Campus Tapajós',
      bairro: 'Salé',
      cidade: 'Santarém',
      estado: 'PA',
      cep: '68040-000',
    },
    ativo: true,
  },
  {
    nome: 'João Silva',
    email: 'joao@ufopa.br',
    senha: '123456',
    tipo: 'cliente' as const,
    telefone: '(93) 99123-4567',
    tipo_pessoa: 'fisica' as const,
    cpf_cnpj: '123.456.789-00',
    endereco: {
      rua: 'Rua Vera Paz, 100',
      bairro: 'Salé',
      cidade: 'Santarém',
      estado: 'PA',
      cep: '68040-000',
    },
    ativo: true,
  },
  {
    nome: 'Maria Santos',
    email: 'maria@prefeitura.gov.br',
    senha: '123456',
    tipo: 'cliente' as const,
    telefone: '(93) 98765-4321',
    tipo_pessoa: 'fisica' as const,
    cpf_cnpj: '987.654.321-00',
    endereco: {
      rua: 'Av. Tapajós, 500',
      bairro: 'Centro',
      cidade: 'Oriximiná',
      estado: 'PA',
      cep: '68270-000',
    },
    ativo: true,
  },
  {
    nome: 'Empresa Solar LTDA',
    email: 'contato@empresasolar.com.br',
    senha: '123456',
    tipo: 'cliente' as const,
    telefone: '(93) 3523-1234',
    tipo_pessoa: 'juridica' as const,
    cpf_cnpj: '12.345.678/0001-90',
    endereco: {
      rua: 'Av. Marechal Rondon, 200',
      bairro: 'Caranazal',
      cidade: 'Santarém',
      estado: 'PA',
      cep: '68040-070',
    },
    ativo: true,
  },
];

async function seed() {
  try {
    console.log('🌱 Conectando ao MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Limpa dados existentes
    console.log('🗑️  Limpando dados existentes...');
    await Sistema.deleteMany({});
    await Cliente.deleteMany({});
    await Leitura.deleteMany({});

    // Insere sistemas
    console.log('📦 Inserindo sistemas...');
    const sistemasInseridos = await Sistema.insertMany(sistemasData);
    console.log(`✅ ${sistemasInseridos.length} sistemas inseridos`);

    // Associa clientes aos sistemas
    const clientesComSistema = clientesData.map((cliente, index) => {
      if (cliente.tipo === 'cliente' && index < sistemasInseridos.length) {
        return {
          ...cliente,
          sistema_id: sistemasInseridos[index - 1]?._id || sistemasInseridos[0]._id,
        };
      }
      return cliente;
    });

    // Insere clientes
    console.log('👤 Inserindo clientes...');
    const clientesInseridos = await Cliente.insertMany(clientesComSistema);
    console.log(`✅ ${clientesInseridos.length} clientes inseridos`);

    // Gera algumas leituras de exemplo
    console.log('📊 Gerando leituras de exemplo...');
    const leituras = [];
    const now = new Date();

    for (const sistema of sistemasInseridos) {
      if (sistema.subsistema && sistema.subsistema.length > 0) {
        // Usa o ID do sistema pois o subsistema não tem _id próprio no schema
        const subsistemaRef = sistema._id;
        
        // Gera 24 leituras (uma por hora do dia anterior)
        for (let h = 0; h < 24; h++) {
          const timestamp = new Date(now);
          timestamp.setHours(now.getHours() - (24 - h));
          
          // Simula geração solar (maior no meio do dia)
          const hourOfDay = timestamp.getHours();
          const solarFactor = hourOfDay >= 6 && hourOfDay <= 18 
            ? Math.sin((hourOfDay - 6) * Math.PI / 12) 
            : 0;
          
          const potenciaBase = 1000;
          const potencia = Math.round(potenciaBase * solarFactor * (0.8 + Math.random() * 0.4));
          
          leituras.push({
            timestamp,
            status: potencia > 100 ? 'Gerando' : 'Standby',
            frequencia_Hz: 60 + (Math.random() - 0.5),
            temperatura: 25 + Math.random() * 15,
            geracao: {
              potencia_W: potencia,
              tensao_V: 220 + (Math.random() - 0.5) * 10,
              corrente_A: potencia / 220,
            },
            bateria: {
              soc_percent: 50 + Math.random() * 50,
              tensao_V: 48 + (Math.random() - 0.5) * 4,
              corrente_A: (Math.random() - 0.5) * 20,
            },
            painel: {
              tensao_V: 36 + Math.random() * 8,
              corrente_A: potencia > 0 ? potencia / 40 : 0,
              potencia_W: potencia,
            },
            id_subsistema: subsistemaRef,
          });
        }
      }
    }

    if (leituras.length > 0) {
      const leiturasInseridas = await Leitura.insertMany(leituras);
      console.log(`✅ ${leiturasInseridas.length} leituras inseridas`);
    }

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📋 Credenciais de acesso:');
    console.log('   Admin: admin@laber.ufopa.br / admin123');
    console.log('   Cliente: joao@ufopa.br / 123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
