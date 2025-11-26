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

export async function getLeituras(subsistemaId?: string): Promise<Leitura[]> {
  const path = subsistemaId 
    ? `/leituras?id_subsistema=${subsistemaId}` 
    : '/leituras';
  return apiGet<Leitura[]>(path);
}

export async function getUltimaLeitura(subsistemaId: string): Promise<Leitura | null> {
  const leituras = await getLeituras(subsistemaId);
  if (leituras.length === 0) return null;
  
  // Ordena por timestamp decrescente e retorna a mais recente
  return leituras.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];
}

export async function createLeitura(data: CreateLeituraDTO): Promise<Leitura> {
  return apiPost<Leitura>('/leituras', data);
}

// Agrupa leituras por hora para gráficos
export function agruparLeiturasPorHora(leituras: Leitura[]): { hora: string; geracao: number; consumo: number }[] {
  const grupos: Record<string, { geracao: number[]; consumo: number[] }> = {};
  
  for (const leitura of leituras) {
    const data = new Date(leitura.timestamp);
    const hora = `${data.getHours().toString().padStart(2, '0')}:00`;
    
    if (!grupos[hora]) {
      grupos[hora] = { geracao: [], consumo: [] };
    }
    
    grupos[hora].geracao.push(leitura.geracao?.potencia_W || 0);
    // Consumo pode ser calculado como diferença entre geração e carga da bateria
    grupos[hora].consumo.push(leitura.painel?.potencia_W || 0);
  }
  
  return Object.entries(grupos)
    .map(([hora, valores]) => ({
      hora,
      geracao: Math.round(valores.geracao.reduce((a, b) => a + b, 0) / valores.geracao.length),
      consumo: Math.round(valores.consumo.reduce((a, b) => a + b, 0) / valores.consumo.length),
    }))
    .sort((a, b) => a.hora.localeCompare(b.hora));
}
