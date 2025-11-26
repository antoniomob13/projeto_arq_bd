// Domain models based on the provided database schema
// Note: ObjectId/ISODate fields represented as string types in the frontend

export type ObjectIdString = string; // e.g., "ObjectId('...')" or raw id string
export type ISODateString = string;  // e.g., "2025-11-04T16:10:00Z"

// Sistema
export interface Sistema {
  _id: ObjectIdString;
  nome: string;
  localizacao: Localizacao;
  subsistema: Subsistema[];
  status_operacional?: string;
  prioridade_teste?: boolean;
  capacidade_wp?: number; // Calculado a partir dos painéis
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
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

// Cliente
export interface Endereco {
  rua?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface Cliente {
  _id?: ObjectIdString;
  nome: string;
  email: string;
  senha?: string;
  tipo: 'admin' | 'cliente';
  telefone?: string;
  cpf_cnpj?: string;
  tipo_pessoa?: 'fisica' | 'juridica';
  endereco?: Endereco;
  sistema_id?: ObjectIdString | Sistema | null;
  ativo?: boolean;
  createdAt?: ISODateString;
  updatedAt?: ISODateString;
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

// Leitura atual para exibição em tempo real
export interface LeituraAtual {
  geracao_w: number;
  consumo_w: number;
  soc_bateria: number;
  status: string;
}
