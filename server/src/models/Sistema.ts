import { Schema, model, Types } from 'mongoose';

const LocalizacaoSchema = new Schema(
  {
    latitude: Number,
    longitude: Number,
    rua: String,
    bairro: String,
    cep: String
  },
  { _id: false }
);

const BateriaSchema = new Schema(
  {
    marca: String,
    modelo: String,
    capacidade_kWh: Number,
    quantidade: Number
  },
  { _id: false }
);

const PainelSchema = new Schema(
  {
    marca: String,
    modelo: String,
    capacidade_Wp: Number,
    quantidade: Number
  },
  { _id: false }
);

const InversorSchema = new Schema(
  { marca: String, modelo: String },
  { _id: false }
);

const ControladorSchema = new Schema(
  { marca: String, modelo: String },
  { _id: false }
);

const ComponentesSchema = new Schema(
  {
    baterias: [BateriaSchema],
    paineis: [PainelSchema],
    inversores: [InversorSchema],
    controladores: [ControladorSchema]
  },
  { _id: false }
);

const SubsistemaSchema = new Schema(
  {
    tipo_sistema: String,
    data_instalacao: Date,
    componentes: ComponentesSchema
  },
  { _id: true }
);

const SistemaSchema = new Schema(
  {
    id_cliente: { type: Schema.Types.ObjectId as unknown as Types.ObjectId, ref: 'Cliente', required: true },
    nome: { type: String, required: true },
    localizacao: LocalizacaoSchema,
    subsistema: [SubsistemaSchema]
  },
  { timestamps: true }
);

export const Sistema = model('Sistema', SistemaSchema);