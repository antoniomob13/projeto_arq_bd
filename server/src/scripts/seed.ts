import mongoose from 'mongoose';
import { Sistema } from '../models/Sistema.js';
import { Cliente } from '../models/Cliente.js';
import { Leitura } from '../models/Leitura.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/solar-db';

// ───────────────────────────────────────────────────────────────────────────────
// HELPERS
// ───────────────────────────────────────────────────────────────────────────────
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(randomBetween(min, max + 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateCPF() {
  const n = () => randomInt(0, 9);
  return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
}

function generateCNPJ() {
  const n = () => randomInt(0, 9);
  return `${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}/0001-${n()}${n()}`;
}

function generatePhone() {
  return `(93) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
}

// ───────────────────────────────────────────────────────────────────────────────
// DADOS DE REFERÊNCIA
// ───────────────────────────────────────────────────────────────────────────────
const CIDADES = [
  { cidade: 'Santarém', estado: 'PA', ceps: ['68040-000', '68040-070', '68040-100'] },
  { cidade: 'Oriximiná', estado: 'PA', ceps: ['68270-000', '68270-050'] },
  { cidade: 'Belterra', estado: 'PA', ceps: ['68143-000'] },
  { cidade: 'Juruti', estado: 'PA', ceps: ['68170-000'] },
  { cidade: 'Óbidos', estado: 'PA', ceps: ['68250-000'] },
  { cidade: 'Alenquer', estado: 'PA', ceps: ['68200-000'] },
  { cidade: 'Monte Alegre', estado: 'PA', ceps: ['68220-000'] },
  { cidade: 'Itaituba', estado: 'PA', ceps: ['68180-000'] },
  { cidade: 'Almeirim', estado: 'PA', ceps: ['68230-000'] },
  { cidade: 'Prainha', estado: 'PA', ceps: ['68240-000'] },
];

const BAIRROS = [
  'Centro', 'Salé', 'Caranazal', 'Maracanã', 'Laguinho', 'Aldeia', 'Santíssimo',
  'Mapiri', 'Jardim Santarém', 'Nova República', 'Floresta', 'Liberdade', 'Fátima',
  'Aeroporto Velho', 'Diamantino', 'Amparo', 'São José Operário', 'Jutaí', 'Uruará',
];

const RUAS = [
  'Rua Vera Paz', 'Av. Marechal Rondon', 'Rua Siqueira Campos', 'Av. Tapajós',
  'Rua Barão do Rio Branco', 'Av. Cuiabá', 'Rua 24 de Outubro', 'Rua Galdino Veloso',
  'Travessa 15 de Agosto', 'Av. Mendonça Furtado', 'Rua Lameira Bittencourt',
  'Travessa Turiano Meira', 'Rua Dom Macedo Costa', 'Av. São Sebastião',
];

const NOMES_MASCULINOS = [
  'João', 'Pedro', 'Carlos', 'José', 'Lucas', 'Mateus', 'Rafael', 'Bruno',
  'Felipe', 'Gabriel', 'Thiago', 'André', 'Ricardo', 'Marcos', 'Fernando',
  'Antônio', 'Paulo', 'Rodrigo', 'Eduardo', 'Gustavo', 'Henrique', 'Diego',
];

const NOMES_FEMININOS = [
  'Maria', 'Ana', 'Julia', 'Fernanda', 'Camila', 'Beatriz', 'Larissa', 'Amanda',
  'Patrícia', 'Carla', 'Sandra', 'Luciana', 'Vanessa', 'Cristina', 'Renata',
  'Juliana', 'Marcela', 'Aline', 'Priscila', 'Tatiana', 'Letícia', 'Débora',
];

const SOBRENOMES = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida',
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Araújo',
  'Melo', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes',
];

const EMPRESAS = [
  'Solar Amazônia LTDA', 'Energia Verde SA', 'Sol do Tapajós ME', 'EcoWatts Soluções',
  'FotoVolt Sistemas', 'Luz Natural EIRELI', 'SunPower Norte', 'Eletrosol Comércio',
  'GreenEnergy Pará', 'Renova Solar', 'Helios Engenharia', 'Solaris Tech',
  'Amazônia Sustentável', 'EnergiaPura LTDA', 'SolBrasil Sistemas',
];

const MARCAS_PAINEL = ['Canadian Solar', 'Trina Solar', 'JA Solar', 'Risen', 'LONGi', 'Jinko Solar', 'BYD'];
const MODELOS_PAINEL = ['CS6K-300MS', 'CS6K-350MS', 'TSM-DE08M.08', 'JAM72S20-455MR', 'RSM144-6-400M', 'Hi-MO 5', 'Tiger Neo'];
const CAPACIDADES_PAINEL = [300, 330, 350, 400, 450, 500, 550];

const MARCAS_BATERIA = ['Freedom', 'Moura Clean', 'Heliar', 'BYD', 'Pylontech', 'LG Chem', 'Tesla'];
const MODELOS_BATERIA = ['DF2500', 'DF3000', 'MF220Ah', 'HT12-200', 'B-Box', 'US3000C', 'RESU10H'];
const CAPACIDADES_BATERIA = [2.4, 2.5, 2.64, 3.0, 3.5, 4.8, 5.0, 10.0, 13.8];

const MARCAS_INVERSOR = ['Growatt', 'Fronius', 'Deye', 'Solis', 'Sungrow', 'SMA', 'Huawei'];
const MODELOS_INVERSOR = ['SPF 5000ES', 'Primo 6.0', 'SUN-5K-SG03LP1', 'RAI-3K-48ES-5G', 'SH10RT', 'Sunny Boy', 'SUN2000'];

const MARCAS_CONTROLADOR = ['Victron', 'EPSolar', 'SRNE', 'Must', 'PowMr', 'Outback'];
const MODELOS_CONTROLADOR = ['SmartSolar MPPT 150/100', 'Tracer 6415AN', 'ML4860', 'PC18-8015F', 'HM-80A', 'FLEXmax 80'];

const STATUS_OPERACIONAIS = ['Online', 'Online', 'Online', 'Online', 'Offline', 'Alerta', 'Manutenção'];
const TIPOS_SISTEMA = ['Híbrido', 'On-Grid', 'Off-Grid'];

// ───────────────────────────────────────────────────────────────────────────────
// GERADORES DE DADOS
// ───────────────────────────────────────────────────────────────────────────────
function gerarLocalizacao() {
  const cidadeData = pickRandom(CIDADES);
  return {
    latitude: randomBetween(-3.0, -1.5),
    longitude: randomBetween(-56.0, -54.0),
    rua: `${pickRandom(RUAS)}, ${randomInt(1, 500)}`,
    bairro: pickRandom(BAIRROS),
    cidade: cidadeData.cidade,
    estado: cidadeData.estado,
    cep: pickRandom(cidadeData.ceps),
  };
}

function gerarSubsistema() {
  const tipoSistema = pickRandom(TIPOS_SISTEMA);
  const qtdPaineis = randomInt(4, 30);
  const qtdBaterias = tipoSistema === 'On-Grid' ? 0 : randomInt(2, 12);

  return {
    tipo_sistema: tipoSistema,
    data_instalacao: new Date(2023, randomInt(0, 11), randomInt(1, 28)),
    componentes: {
      baterias: qtdBaterias > 0 ? [{
        marca: pickRandom(MARCAS_BATERIA),
        modelo: pickRandom(MODELOS_BATERIA),
        capacidade_kWh: pickRandom(CAPACIDADES_BATERIA),
        quantidade: qtdBaterias,
      }] : [],
      paineis: [{
        marca: pickRandom(MARCAS_PAINEL),
        modelo: pickRandom(MODELOS_PAINEL),
        capacidade_Wp: pickRandom(CAPACIDADES_PAINEL),
        quantidade: qtdPaineis,
      }],
      inversores: [{
        marca: pickRandom(MARCAS_INVERSOR),
        modelo: pickRandom(MODELOS_INVERSOR),
      }],
      controladores: tipoSistema !== 'On-Grid' ? [{
        marca: pickRandom(MARCAS_CONTROLADOR),
        modelo: pickRandom(MODELOS_CONTROLADOR),
      }] : [],
    },
  };
}

function gerarSistema(index: number) {
  const loc = gerarLocalizacao();
  const numSubsistemas = randomInt(1, 3);
  const subsistemas = [];
  for (let i = 0; i < numSubsistemas; i++) {
    subsistemas.push(gerarSubsistema());
  }

  return {
    nome: `Unidade ${loc.cidade} ${String(index + 1).padStart(2, '0')}`,
    status_operacional: pickRandom(STATUS_OPERACIONAIS),
    localizacao: {
      latitude: loc.latitude,
      longitude: loc.longitude,
      rua: loc.rua,
      bairro: loc.bairro,
      cep: loc.cep,
    },
    subsistema: subsistemas,
  };
}

function gerarCliente(index: number, tipo: 'admin' | 'cliente', sistemaId?: mongoose.Types.ObjectId) {
  const isMale = Math.random() > 0.5;
  const isEmpresa = tipo === 'cliente' && Math.random() > 0.7;
  const nome = isEmpresa
    ? pickRandom(EMPRESAS)
    : `${pickRandom(isMale ? NOMES_MASCULINOS : NOMES_FEMININOS)} ${pickRandom(SOBRENOMES)} ${pickRandom(SOBRENOMES)}`;
  const emailBase = isEmpresa
    ? nome.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15)
    : nome.toLowerCase().split(' ').slice(0, 2).join('.').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const dominios = ['@gmail.com', '@hotmail.com', '@ufopa.br', '@prefeitura.gov.br', '@empresa.com.br'];

  const loc = gerarLocalizacao();

  return {
    nome,
    email: `${emailBase}${index}${pickRandom(dominios)}`,
    senha: tipo === 'admin' ? 'admin123' : '123456',
    tipo,
    telefone: generatePhone(),
    tipo_pessoa: isEmpresa ? 'juridica' as const : 'fisica' as const,
    cpf_cnpj: isEmpresa ? generateCNPJ() : generateCPF(),
    endereco: {
      rua: loc.rua,
      bairro: loc.bairro,
      cidade: loc.cidade,
      estado: loc.estado,
      cep: loc.cep,
    },
    ativo: true, // Todos os clientes ativos
    sistema_id: sistemaId,
  };
}

function gerarLeituras(sistemaId: mongoose.Types.ObjectId, subsistemaIndex: number, dataInicio: Date, dataFim: Date) {
  const leituras: any[] = [];
  const current = new Date(dataInicio);

  // Gera leituras a cada 15 minutos
  while (current <= dataFim) {
    const hourOfDay = current.getHours();
    const dayOfYear = Math.floor((current.getTime() - new Date(current.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Fator sazonal (mais sol no verão amazônico: jun-nov)
    const month = current.getMonth();
    const seasonalFactor = month >= 5 && month <= 10 ? 1.0 : 0.85;
    
    // Fator solar baseado na hora do dia
    let solarFactor = 0;
    if (hourOfDay >= 5 && hourOfDay <= 19) {
      // Curva de geração solar (pico às 12h)
      solarFactor = Math.sin((hourOfDay - 5) * Math.PI / 14);
      // Adiciona variação por nuvens
      const cloudFactor = 0.7 + Math.random() * 0.3;
      solarFactor *= cloudFactor * seasonalFactor;
    }

    // Variação aleatória para simular condições reais
    const randomVariation = 0.85 + Math.random() * 0.3;
    
    const potenciaBase = randomBetween(800, 2500); // Varia por sistema
    const potencia = Math.max(0, Math.round(potenciaBase * solarFactor * randomVariation));
    
    // Estado da bateria (carrega de dia, descarrega à noite)
    const baseSoc = 50;
    const socVariation = solarFactor > 0.3 ? randomBetween(10, 40) : randomBetween(-20, 10);
    const soc = Math.min(100, Math.max(10, baseSoc + socVariation));

    // Consumo (maior de manhã e à noite)
    const consumoBase = randomBetween(200, 800);
    const consumoFactor = (hourOfDay >= 6 && hourOfDay <= 9) || (hourOfDay >= 18 && hourOfDay <= 22) ? 1.3 : 0.8;
    const consumo = Math.round(consumoBase * consumoFactor * (0.8 + Math.random() * 0.4));

    // Determina status
    let status: string;
    if (potencia > 100) {
      status = 'Gerando';
    } else if (soc > 20) {
      status = 'Bateria';
    } else {
      status = 'Standby';
    }

    // Ocasionalmente gera alertas
    if (Math.random() < 0.005) {
      status = pickRandom(['Alerta', 'Erro', 'Manutenção']);
    }

    leituras.push({
      timestamp: new Date(current),
      status,
      frequencia_Hz: 60 + randomBetween(-0.5, 0.5),
      temperatura: randomBetween(25, 45),
      geracao: {
        potencia_W: potencia,
        tensao_V: 220 + randomBetween(-10, 10),
        corrente_A: potencia > 0 ? potencia / 220 : 0,
        energia_kWh: potencia * 0.25 / 1000, // 15 min em horas
      },
      consumo: {
        potencia_W: consumo,
        tensao_V: 220 + randomBetween(-5, 5),
        corrente_A: consumo / 220,
        energia_kWh: consumo * 0.25 / 1000,
      },
      bateria: {
        soc_percent: soc,
        tensao_V: 48 + randomBetween(-2, 2),
        corrente_A: solarFactor > 0.3 ? randomBetween(5, 25) : randomBetween(-20, -5),
        temperatura: randomBetween(28, 40),
      },
      painel: {
        tensao_V: potencia > 0 ? 36 + randomBetween(0, 8) : 0,
        corrente_A: potencia > 0 ? potencia / 40 : 0,
        potencia_W: potencia,
        temperatura: randomBetween(30, 55),
      },
      id_subsistema: sistemaId, // Usando ID do sistema como referência
      subsistema_index: subsistemaIndex,
    });

    // Avança 15 minutos
    current.setMinutes(current.getMinutes() + 15);
  }

  return leituras;
}

// ───────────────────────────────────────────────────────────────────────────────
// FUNÇÃO PRINCIPAL DE SEED
// ───────────────────────────────────────────────────────────────────────────────
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

    // ─────────────────────────────────────────────────────────────────────────
    // SISTEMAS (25 sistemas)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('📦 Gerando 25 sistemas...');
    const sistemasData = [];
    for (let i = 0; i < 25; i++) {
      sistemasData.push(gerarSistema(i));
    }
    const sistemasInseridos = await Sistema.insertMany(sistemasData);
    console.log(`✅ ${sistemasInseridos.length} sistemas inseridos`);

    // Conta subsistemas
    let totalSubsistemas = 0;
    sistemasInseridos.forEach(s => {
      totalSubsistemas += s.subsistema?.length || 0;
    });
    console.log(`   └─ Total de subsistemas: ${totalSubsistemas}`);

    // ─────────────────────────────────────────────────────────────────────────
    // CLIENTES (50 clientes + 3 admins)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('👤 Gerando 53 clientes...');
    const clientesData: any[] = [];

    // 3 administradores
    clientesData.push({
      nome: 'Administrador LABER',
      email: 'admin@laber.ufopa.br',
      senha: 'admin123',
      tipo: 'admin',
      telefone: '(93) 99999-0000',
      cpf_cnpj: '000.000.000-01',
      tipo_pessoa: 'fisica',
      endereco: { rua: 'Rua Vera Paz, Campus Tapajós', bairro: 'Salé', cidade: 'Santarém', estado: 'PA', cep: '68040-000' },
      ativo: true,
    });
    clientesData.push({
      nome: 'Dr. Carlos Pesquisador',
      email: 'carlos.pesquisador@ufopa.br',
      senha: 'admin123',
      tipo: 'admin',
      telefone: '(93) 99888-1111',
      cpf_cnpj: '000.000.000-02',
      tipo_pessoa: 'fisica',
      endereco: { rua: 'Av. Marechal Rondon, 50', bairro: 'Caranazal', cidade: 'Santarém', estado: 'PA', cep: '68040-070' },
      ativo: true,
    });
    clientesData.push({
      nome: 'Profa. Ana Coordenadora',
      email: 'ana.coord@ufopa.br',
      senha: 'admin123',
      tipo: 'admin',
      telefone: '(93) 99777-2222',
      cpf_cnpj: '000.000.000-03',
      tipo_pessoa: 'fisica',
      endereco: { rua: 'Campus Tapajós, Bloco B', bairro: 'Salé', cidade: 'Santarém', estado: 'PA', cep: '68040-000' },
      ativo: true,
    });

    // 50 clientes distribuídos entre os sistemas
    for (let i = 0; i < 50; i++) {
      const sistemaIndex = i % sistemasInseridos.length;
      const sistemaId = sistemasInseridos[sistemaIndex]._id;
      clientesData.push(gerarCliente(i, 'cliente', sistemaId));
    }

    const clientesInseridos = await Cliente.insertMany(clientesData);
    console.log(`✅ ${clientesInseridos.length} clientes inseridos`);
    console.log(`   └─ Admins: 3 | Clientes: ${clientesInseridos.length - 3}`);

    // ─────────────────────────────────────────────────────────────────────────
    // LEITURAS (3 meses de dados, a cada 15 min)
    // ─────────────────────────────────────────────────────────────────────────
    console.log('📊 Gerando 3 meses de leituras (isso pode demorar)...');
    
    const dataFim = new Date();
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - 3);

    let totalLeituras = 0;
    const BATCH_SIZE = 5000;

    for (let sIdx = 0; sIdx < sistemasInseridos.length; sIdx++) {
      const sistema = sistemasInseridos[sIdx];
      const numSubsistemas = sistema.subsistema?.length || 1;

      for (let subIdx = 0; subIdx < numSubsistemas; subIdx++) {
        process.stdout.write(`   Sistema ${sIdx + 1}/${sistemasInseridos.length} - Subsistema ${subIdx + 1}/${numSubsistemas}...\r`);

        const leituras = gerarLeituras(sistema._id, subIdx, dataInicio, dataFim);
        
        // Insere em lotes para evitar uso excessivo de memória
        for (let i = 0; i < leituras.length; i += BATCH_SIZE) {
          const batch = leituras.slice(i, i + BATCH_SIZE);
          await Leitura.insertMany(batch, { ordered: false });
        }
        
        totalLeituras += leituras.length;
      }
    }

    console.log(`\n✅ ${totalLeituras.toLocaleString()} leituras inseridas`);
    console.log(`   └─ Período: ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`);
    console.log(`   └─ Intervalo: 15 minutos`);

    // ─────────────────────────────────────────────────────────────────────────
    // RESUMO FINAL
    // ─────────────────────────────────────────────────────────────────────────
    console.log('\n' + '═'.repeat(60));
    console.log('🎉 SEED CONCLUÍDO COM SUCESSO!');
    console.log('═'.repeat(60));
    console.log(`\n📊 Resumo dos dados inseridos:`);
    console.log(`   • Sistemas:     ${sistemasInseridos.length}`);
    console.log(`   • Subsistemas:  ${totalSubsistemas}`);
    console.log(`   • Clientes:     ${clientesInseridos.length}`);
    console.log(`   • Leituras:     ${totalLeituras.toLocaleString()}`);
    console.log(`\n🔐 Credenciais de acesso:`);
    console.log(`   Admin:   admin@laber.ufopa.br / admin123`);
    console.log(`   Admin:   carlos.pesquisador@ufopa.br / admin123`);
    console.log(`   Admin:   ana.coord@ufopa.br / admin123`);
    console.log(`   Cliente: (qualquer email de cliente) / 123456`);
    console.log('═'.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Erro no seed:', error);
    process.exit(1);
  }
}

seed();
