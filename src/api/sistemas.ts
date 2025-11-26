import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Sistema } from '../models/domain';

export interface CreateSistemaDTO {
  nome: string;
  localizacao?: {
    latitude?: number;
    longitude?: number;
    rua?: string;
    bairro?: string;
    cep?: string;
  };
  subsistema?: Array<{
    tipo_sistema?: string;
    data_instalacao?: string;
    componentes?: {
      baterias?: Array<{ marca: string; modelo: string; capacidade_kWh: number; quantidade: number }>;
      paineis?: Array<{ marca: string; modelo: string; capacidade_Wp: number; quantidade: number }>;
      inversores?: Array<{ marca: string; modelo: string }>;
      controladores?: Array<{ marca: string; modelo: string }>;
    };
  }>;
  status_operacional?: string;
}

export type UpdateSistemaDTO = Partial<CreateSistemaDTO>;

// Calcula a capacidade total em Wp a partir dos painéis do sistema
export function calcularCapacidadeTotal(sistemas: Sistema | Sistema[]): number {
  const arr = Array.isArray(sistemas) ? sistemas : [sistemas];
  let total = 0;
  for (const sistema of arr) {
    for (const sub of sistema.subsistema || []) {
      for (const painel of sub.componentes?.paineis || []) {
        total += (painel.capacidade_Wp || 0) * (painel.quantidade || 0);
      }
    }
  }
  return total;
}

export async function getSistemas(): Promise<Sistema[]> {
  const sistemas = await apiGet<Sistema[]>('/sistemas');
  // Adiciona capacidade calculada a cada sistema
  return sistemas.map(s => ({
    ...s,
    capacidade_wp: calcularCapacidadeTotal(s)
  }));
}

export async function getSistemaById(id: string): Promise<Sistema> {
  const sistema = await apiGet<Sistema>(`/sistemas/${id}`);
  return {
    ...sistema,
    capacidade_wp: calcularCapacidadeTotal(sistema)
  };
}

export async function createSistema(data: CreateSistemaDTO): Promise<Sistema> {
  return apiPost<Sistema>('/sistemas', data);
}

export async function updateSistema(id: string, data: UpdateSistemaDTO): Promise<Sistema> {
  return apiPut<Sistema>(`/sistemas/${id}`, data);
}

export async function deleteSistema(id: string): Promise<void> {
  return apiDelete(`/sistemas/${id}`);
}
