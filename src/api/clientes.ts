import { apiGet, apiPost, apiPut, apiDelete } from './client';
import type { Cliente, Endereco } from '../models/domain';

export interface CreateClienteDTO {
  nome: string;
  email: string;
  senha: string;
  tipo?: 'admin' | 'cliente';
  telefone?: string;
  cpf_cnpj?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  endereco?: Endereco;
  sistema_id?: string | null;
  ativo?: boolean;
}

export interface UpdateClienteDTO {
  nome?: string;
  email?: string;
  senha?: string;
  tipo?: 'admin' | 'cliente';
  telefone?: string;
  cpf_cnpj?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  endereco?: Endereco;
  sistema_id?: string | null;
  ativo?: boolean;
}

export interface LoginDTO {
  email: string;
  senha: string;
}

export interface LoginResponse {
  _id: string;
  nome: string;
  email: string;
  tipo: 'admin' | 'cliente';
  telefone?: string;
  endereco?: Endereco;
  sistema_id?: string | { _id: string; nome: string } | null;
  ativo: boolean;
}

export async function getClientes(): Promise<Cliente[]> {
  return apiGet<Cliente[]>('/clientes');
}

export async function getClienteById(id: string): Promise<Cliente> {
  return apiGet<Cliente>(`/clientes/${id}`);
}

export async function createCliente(data: CreateClienteDTO): Promise<Cliente> {
  return apiPost<Cliente>('/clientes', data);
}

export async function updateCliente(id: string, data: UpdateClienteDTO): Promise<Cliente> {
  return apiPut<Cliente>(`/clientes/${id}`, data);
}

export async function deleteCliente(id: string): Promise<void> {
  return apiDelete(`/clientes/${id}`);
}

export async function loginCliente(data: LoginDTO): Promise<LoginResponse> {
  return apiPost<LoginResponse>('/clientes/login', data);
}
