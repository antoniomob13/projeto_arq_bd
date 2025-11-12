// Domain models based on the provided database schema
// Note: ObjectId/ISODate fields represented as string types in the frontend

export type ObjectIdString = string; // e.g., "ObjectId('...')" or raw id string
export type ISODateString = string;  // e.g., "2025-11-04T16:10:00Z"

// Sistema
export interface Sistema {
  _id: ObjectIdString;
  id_cliente: ObjectIdString;
  nome: string;
  localizacao: Localizacao;
  subsistema: Subsistema[];
}

export interface Localizacao {
  latitude: number;
  longitude: number;
  rua: string;
  bairro: string;
  cep: string;
}

export interface Subsistema {
  _id: ObjectIdString;
  tipo_sistema: string; // e.g., "Híbrido"
  data_instalacao: ISODateString;
  componentes: Componentes;
}

export interface Componentes {
  baterias?: Bateria[];
  paineis?: Painel[];
  inversores?: Inversor[];
  controladores?: Controlador[];
}

export interface Bateria {
  marca: string;
  modelo: string;
  capacidade_kWh: number;
  quantidade: number;
}

export interface Painel {
  marca: string;
  modelo: string;
  capacidade_Wp: number;
  quantidade: number;
}

export interface Inversor {
  marca: string;
  modelo: string;
}

export interface Controlador {
  marca: string;
  modelo: string;
}

// Leitura
export interface Leitura {
  _id: ObjectIdString;
  timestamp: ISODateString;
  status: string; // e.g., "Gerando"
  frequencia_Hz: number;
  temperatura: number;
  geracao: Geracao;
  bateria: BateriaEstado;
  painel: PainelEstado;
  id_subsistema: ObjectIdString;
}

export interface Geracao {
  potencia_W: number;
  tensao_V: number;
  corrente_A: number;
}

export interface BateriaEstado {
  soc_percent: number;
  tensao_V: number;
  corrente_A: number;
}

export interface PainelEstado {
  tensao_V: number;
  corrente_A: number;
  potencia_W: number;
}

// Cliente
export interface Cliente {
  _id: ObjectIdString;
  nome: string;
  cpf_cnpj: string;
  tipo_pessoa: 'F' | 'J';
  data_nasc: ISODateString;
  telefone: string;
  email: string;
  endereco: Endereco;
  sistemas: Array<{ id_sistema: ObjectIdString }>; // references to Sistemas
}

export interface Endereco {
  rua: string;
  bairro: string;
  complemento?: string;
  cep: string;
  cidade: string;
  estado: string;
}
