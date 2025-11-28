import { Schema, model, Types } from 'mongoose';

const GeracaoSchema = new Schema(
  { potencia_W: Number, tensao_V: Number, corrente_A: Number, energia_kWh: Number },
  { _id: false }
);

const ConsumoSchema = new Schema(
  { potencia_W: Number, tensao_V: Number, corrente_A: Number, energia_kWh: Number },
  { _id: false }
);

const BateriaEstadoSchema = new Schema(
  { soc_percent: Number, tensao_V: Number, corrente_A: Number, temperatura: Number },
  { _id: false }
);

const PainelEstadoSchema = new Schema(
  { tensao_V: Number, corrente_A: Number, potencia_W: Number, temperatura: Number },
  { _id: false }
);

const LeituraSchema = new Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    status: String,
    frequencia_Hz: Number,
    temperatura: Number,
    geracao: GeracaoSchema,
    consumo: ConsumoSchema,
    bateria: BateriaEstadoSchema,
    painel: PainelEstadoSchema,
    id_subsistema: { type: Schema.Types.ObjectId as unknown as Types.ObjectId, required: true, index: true },
    subsistema_index: Number, // índice do subsistema dentro do sistema
  },
  { timestamps: true }
);

// Índice composto para buscas eficientes
LeituraSchema.index({ id_subsistema: 1, timestamp: -1 });

export const Leitura = model('Leitura', LeituraSchema);