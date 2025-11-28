import { Router } from 'express';
import { Leitura } from '../models/Leitura.js';
import { Sistema } from '../models/Sistema.js';
import mongoose from 'mongoose';

const r = Router();

// GET /api/leituras - Lista leituras com filtros
// Query params:
//   - sistema: ID do sistema (busca todas leituras dos subsistemas desse sistema)
//   - id_subsistema: ID específico do subsistema
//   - data_inicio: Data inicial (ISO string)
//   - data_fim: Data final (ISO string)
//   - periodo: 'diario' | 'semanal' | 'mensal'
//   - limit: número máximo de registros
r.get('/', async (req, res) => {
  try {
    const { sistema, id_subsistema, data_inicio, data_fim, periodo, limit } = req.query;
    
    const query: any = {};
    
    // Filtro por sistema (busca o sistema e usa seu _id como id_subsistema)
    if (sistema && typeof sistema === 'string') {
      // No seed, usamos o _id do sistema como id_subsistema
      if (mongoose.Types.ObjectId.isValid(sistema)) {
        query.id_subsistema = new mongoose.Types.ObjectId(sistema);
      }
    }
    
    // Filtro direto por subsistema
    if (id_subsistema && typeof id_subsistema === 'string') {
      if (mongoose.Types.ObjectId.isValid(id_subsistema)) {
        query.id_subsistema = new mongoose.Types.ObjectId(id_subsistema);
      }
    }
    
    // Filtro por período de datas
    if (data_inicio || data_fim) {
      query.timestamp = {};
      if (data_inicio && typeof data_inicio === 'string') {
        query.timestamp.$gte = new Date(data_inicio);
      }
      if (data_fim && typeof data_fim === 'string') {
        const endDate = new Date(data_fim);
        endDate.setHours(23, 59, 59, 999);
        query.timestamp.$lte = endDate;
      }
    }
    
    // Se período é diário e temos data_inicio, filtrar apenas esse dia
    if (periodo === 'diario' && data_inicio && typeof data_inicio === 'string') {
      const startOfDay = new Date(data_inicio);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(data_inicio);
      endOfDay.setHours(23, 59, 59, 999);
      query.timestamp = { $gte: startOfDay, $lte: endOfDay };
    }
    
    const maxLimit = Math.min(parseInt(limit as string) || 10000, 50000);
    
    const items = await Leitura.find(query)
      .sort({ timestamp: 1 })
      .limit(maxLimit)
      .lean();
    
    res.json(items);
  } catch (error) {
    console.error('Erro ao buscar leituras:', error);
    res.status(500).json({ error: 'Erro ao buscar leituras' });
  }
});

// GET /api/leituras/stats - Estatísticas das leituras (debug)
r.get('/stats', async (_req, res) => {
  try {
    const total = await Leitura.countDocuments();
    const sistemas = await Leitura.distinct('id_subsistema');
    
    // Buscar range de datas
    const primeira = await Leitura.findOne().sort({ timestamp: 1 }).lean();
    const ultima = await Leitura.findOne().sort({ timestamp: -1 }).lean();
    
    res.json({
      total_leituras: total,
      total_sistemas: sistemas.length,
      sistemas_ids: sistemas.slice(0, 5).map(s => s.toString()),
      data_mais_antiga: primeira?.timestamp,
      data_mais_recente: ultima?.timestamp,
    });
  } catch (error) {
    console.error('Erro ao buscar stats:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
});

// GET /api/leituras/agregado - Dados agregados para gráficos
// Agrupa por hora/dia/mês dependendo do período
r.get('/agregado', async (req, res) => {
  try {
    const { sistema, subsistema, data_inicio, data_fim, periodo = 'diario' } = req.query;
    
    if (!sistema || typeof sistema !== 'string') {
      return res.status(400).json({ error: 'Parâmetro sistema é obrigatório' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(sistema)) {
      return res.status(400).json({ error: 'ID de sistema inválido' });
    }
    
    const sistemaId = new mongoose.Types.ObjectId(sistema);
    
    // Parse subsistema index (optional)
    const subsistemaIndex = subsistema && typeof subsistema === 'string' 
      ? parseInt(subsistema, 10) 
      : null;
    
    // Determinar intervalo de datas
    let startDate: Date;
    let endDate: Date;
    
    if (data_inicio && typeof data_inicio === 'string') {
      startDate = new Date(data_inicio);
      startDate.setHours(0, 0, 0, 0);
    } else {
      // Padrão: hoje
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }
    
    if (data_fim && typeof data_fim === 'string') {
      endDate = new Date(data_fim);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Fim do dia selecionado
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
    }
    
    // Definir agrupamento baseado no período
    let groupBy: any;
    let projectLabel: any;
    
    switch (periodo) {
      case 'semanal':
        groupBy = {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' },
          dayOfWeek: { $dayOfWeek: '$timestamp' }
        };
        projectLabel = {
          $concat: [
            { $switch: {
              branches: [
                { case: { $eq: ['$_id.dayOfWeek', 1] }, then: 'Dom' },
                { case: { $eq: ['$_id.dayOfWeek', 2] }, then: 'Seg' },
                { case: { $eq: ['$_id.dayOfWeek', 3] }, then: 'Ter' },
                { case: { $eq: ['$_id.dayOfWeek', 4] }, then: 'Qua' },
                { case: { $eq: ['$_id.dayOfWeek', 5] }, then: 'Qui' },
                { case: { $eq: ['$_id.dayOfWeek', 6] }, then: 'Sex' },
                { case: { $eq: ['$_id.dayOfWeek', 7] }, then: 'Sáb' },
              ],
              default: ''
            }}
          ]
        };
        break;
        
      case 'mensal':
        groupBy = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        };
        projectLabel = {
          $concat: [
            { $toString: '$_id.day' },
            '/',
            { $toString: '$_id.month' }
          ]
        };
        break;
        
      case 'anual':
        groupBy = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' }
        };
        projectLabel = {
          $switch: {
            branches: [
              { case: { $eq: ['$_id.month', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id.month', 2] }, then: 'Fev' },
              { case: { $eq: ['$_id.month', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id.month', 4] }, then: 'Abr' },
              { case: { $eq: ['$_id.month', 5] }, then: 'Mai' },
              { case: { $eq: ['$_id.month', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id.month', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id.month', 8] }, then: 'Ago' },
              { case: { $eq: ['$_id.month', 9] }, then: 'Set' },
              { case: { $eq: ['$_id.month', 10] }, then: 'Out' },
              { case: { $eq: ['$_id.month', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id.month', 12] }, then: 'Dez' },
            ],
            default: ''
          }
        };
        break;
        
      default: // diario - agrupa por hora
        groupBy = {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' },
          hour: { $hour: '$timestamp' }
        };
        projectLabel = {
          $concat: [
            { $cond: [{ $lt: ['$_id.hour', 10] }, '0', ''] },
            { $toString: '$_id.hour' },
            ':00'
          ]
        };
    }
    
    // Build match query
    const matchQuery: any = {
      id_subsistema: sistemaId,
      timestamp: { $gte: startDate, $lte: endDate }
    };
    
    // Add subsistema filter if provided
    if (subsistemaIndex !== null && !isNaN(subsistemaIndex)) {
      matchQuery.subsistema_index = subsistemaIndex;
    }
    
    const pipeline = [
      {
        $match: matchQuery
      },
      {
        $group: {
          _id: groupBy,
          // Potência (W)
          geracao_potencia_avg: { $avg: '$geracao.potencia_W' },
          geracao_potencia_max: { $max: '$geracao.potencia_W' },
          consumo_potencia_avg: { $avg: { $ifNull: ['$consumo.potencia_W', '$painel.potencia_W'] } },
          // Tensão (V)
          geracao_tensao_avg: { $avg: '$geracao.tensao_V' },
          consumo_tensao_avg: { $avg: { $ifNull: ['$consumo.tensao_V', '$painel.tensao_V'] } },
          // Corrente (A)
          geracao_corrente_avg: { $avg: '$geracao.corrente_A' },
          consumo_corrente_avg: { $avg: { $ifNull: ['$consumo.corrente_A', '$painel.corrente_A'] } },
          // Energia (kWh)
          geracao_energia_sum: { $sum: '$geracao.energia_kWh' },
          consumo_energia_sum: { $sum: { $ifNull: ['$consumo.energia_kWh', 0] } },
          // Outros
          bateria_soc_avg: { $avg: '$bateria.soc_percent' },
          bateria_tensao_avg: { $avg: '$bateria.tensao_V' },
          bateria_corrente_avg: { $avg: '$bateria.corrente_A' },
          temperatura_avg: { $avg: '$temperatura' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          label: projectLabel,
          sortKey: '$_id',
          // Potência (W) - mantém nomes antigos para compatibilidade
          geracao: { $round: ['$geracao_potencia_avg', 0] },
          geracao_max: { $round: ['$geracao_potencia_max', 0] },
          consumo: { $round: ['$consumo_potencia_avg', 0] },
          // Tensão (V)
          geracao_tensao: { $round: ['$geracao_tensao_avg', 1] },
          consumo_tensao: { $round: ['$consumo_tensao_avg', 1] },
          // Corrente (A)
          geracao_corrente: { $round: ['$geracao_corrente_avg', 2] },
          consumo_corrente: { $round: ['$consumo_corrente_avg', 2] },
          // Energia (kWh)
          geracao_energia: { $round: ['$geracao_energia_sum', 3] },
          consumo_energia: { $round: ['$consumo_energia_sum', 3] },
          // Bateria
          bateria_soc: { $round: ['$bateria_soc_avg', 1] },
          bateria_tensao: { $round: ['$bateria_tensao_avg', 1] },
          bateria_corrente: { $round: ['$bateria_corrente_avg', 2] },
          // Outros
          temperatura: { $round: ['$temperatura_avg', 1] },
          amostras: '$count'
        }
      },
      { $sort: { sortKey: 1 as const } }
    ];
    
    const resultado = await Leitura.aggregate(pipeline as any);
    
    res.json({
      sistema,
      subsistema: subsistemaIndex,
      periodo,
      data_inicio: startDate.toISOString(),
      data_fim: endDate.toISOString(),
      total_pontos: resultado.length,
      dados: resultado.map(r => ({
        label: r.label,
        // Potência (W)
        geracao: r.geracao || 0,
        geracao_max: r.geracao_max || 0,
        consumo: r.consumo || 0,
        // Tensão (V)
        geracao_tensao: r.geracao_tensao || 0,
        consumo_tensao: r.consumo_tensao || 0,
        // Corrente (A)
        geracao_corrente: r.geracao_corrente || 0,
        consumo_corrente: r.consumo_corrente || 0,
        // Energia (kWh)
        geracao_energia: r.geracao_energia || 0,
        consumo_energia: r.consumo_energia || 0,
        // Bateria
        bateria_soc: r.bateria_soc || 0,
        bateria_tensao: r.bateria_tensao || 0,
        bateria_corrente: r.bateria_corrente || 0,
        // Outros
        temperatura: r.temperatura || 0,
        amostras: r.amostras
      }))
    });
    
  } catch (error) {
    console.error('Erro ao agregar leituras:', error);
    res.status(500).json({ error: 'Erro ao agregar leituras' });
  }
});

// GET /api/leituras/ultima/:sistemaId - Última leitura de um sistema
r.get('/ultima/:sistemaId', async (req, res) => {
  try {
    const { sistemaId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(sistemaId)) {
      return res.status(400).json({ error: 'ID de sistema inválido' });
    }
    
    const leitura = await Leitura.findOne({
      id_subsistema: new mongoose.Types.ObjectId(sistemaId)
    })
      .sort({ timestamp: -1 })
      .lean();
    
    if (!leitura) {
      return res.status(404).json({ error: 'Nenhuma leitura encontrada' });
    }
    
    res.json(leitura);
  } catch (error) {
    console.error('Erro ao buscar última leitura:', error);
    res.status(500).json({ error: 'Erro ao buscar última leitura' });
  }
});

// POST /api/leituras - Criar nova leitura
r.post('/', async (req, res) => {
  try {
    const created = await Leitura.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    console.error('Erro ao criar leitura:', error);
    res.status(500).json({ error: 'Erro ao criar leitura' });
  }
});

export default r;