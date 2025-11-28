import { apiGet, apiPost } from './client';
import type { Leitura } from '../models/domain';

export interface CreateLeituraDTO {
  timestamp: string;
  status: string;
  frequencia_Hz?: number;
  temperatura?: number;
  geracao?: {
    potencia_W: number;
    tensao_V: number;
    corrente_A: number;
  };
  bateria?: {
    soc_percent: number;
    tensao_V: number;
    corrente_A: number;
  };
  painel?: {
    tensao_V: number;
    corrente_A: number;
    potencia_W: number;
  };
  id_subsistema: string;
}

export interface DadoAgregado {
  label: string;
  // Potência (W)
  geracao: number;
  geracao_max: number;
  consumo: number;
  // Tensão (V)
  geracao_tensao: number;
  consumo_tensao: number;
  // Corrente (A)
  geracao_corrente: number;
  consumo_corrente: number;
  // Energia (kWh)
  geracao_energia: number;
  consumo_energia: number;
  // Bateria
  bateria_soc: number;
  bateria_tensao: number;
  bateria_corrente: number;
  // Outros
  temperatura: number;
  amostras: number;
}

export interface RespostaAgregada {
  sistema: string;
  subsistema: number | null;
  periodo: string;
  data_inicio: string;
  data_fim: string;
  total_pontos: number;
  dados: DadoAgregado[];
}

export async function getLeituras(sistemaId?: string, dataInicio?: string, dataFim?: string): Promise<Leitura[]> {
  const params = new URLSearchParams();
  if (sistemaId) params.append('sistema', sistemaId);
  if (dataInicio) params.append('data_inicio', dataInicio);
  if (dataFim) params.append('data_fim', dataFim);
  
  const queryString = params.toString();
  const path = queryString ? `/leituras?${queryString}` : '/leituras';
  return apiGet<Leitura[]>(path);
}

export async function getLeiturasAgregadas(
  sistemaId: string,
  dataInicio?: string,
  dataFim?: string,
  periodo: 'diario' | 'semanal' | 'mensal' | 'anual' = 'diario',
  subsistemaIndex?: number
): Promise<RespostaAgregada> {
  const params = new URLSearchParams();
  params.append('sistema', sistemaId);
  params.append('periodo', periodo);
  if (dataInicio) params.append('data_inicio', dataInicio);
  if (dataFim) params.append('data_fim', dataFim);
  if (subsistemaIndex !== undefined) params.append('subsistema', subsistemaIndex.toString());
  
  return apiGet<RespostaAgregada>(`/leituras/agregado?${params.toString()}`);
}

export async function getUltimaLeitura(sistemaId: string): Promise<Leitura | null> {
  try {
    return await apiGet<Leitura>(`/leituras/ultima/${sistemaId}`);
  } catch {
    return null;
  }
}

export async function createLeitura(data: CreateLeituraDTO): Promise<Leitura> {
  return apiPost<Leitura>('/leituras', data);
}

// Agrupa leituras por hora para gráficos (fallback local)
export function agruparLeiturasPorHora(leituras: Leitura[]): { hora: string; geracao: number; consumo: number }[] {
  const grupos: Record<string, { geracao: number[]; consumo: number[] }> = {};
  
  for (const leitura of leituras) {
    const data = new Date(leitura.timestamp);
    const hora = `${data.getHours().toString().padStart(2, '0')}:00`;
    
    if (!grupos[hora]) {
      grupos[hora] = { geracao: [], consumo: [] };
    }
    
    grupos[hora].geracao.push(leitura.geracao?.potencia_W || 0);
    grupos[hora].consumo.push(leitura.consumo?.potencia_W || leitura.painel?.potencia_W || 0);
  }
  
  return Object.entries(grupos)
    .map(([hora, valores]) => ({
      hora,
      geracao: Math.round(valores.geracao.reduce((a, b) => a + b, 0) / valores.geracao.length),
      consumo: Math.round(valores.consumo.reduce((a, b) => a + b, 0) / valores.consumo.length),
    }))
    .sort((a, b) => a.hora.localeCompare(b.hora));
}
