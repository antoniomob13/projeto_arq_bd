import { Schema, model, Types } from 'mongoose';

const GeracaoSchema = new Schema(
  { potencia_W: Number, tensao_V: Number, corrente_A: Number },
  { _id: false }
);

const BateriaEstadoSchema = new Schema(
  { soc_percent: Number, tensao_V: Number, corrente_A: Number },
  { _id: false }
);

const PainelEstadoSchema = new Schema(
  { tensao_V: Number, corrente_A: Number, potencia_W: Number },
  { _id: false }
);

const LeituraSchema = new Schema(
  {
    timestamp: { type: Date, required: true },
    status: String,
    frequencia_Hz: Number,
    temperatura: Number,
    geracao: GeracaoSchema,
    bateria: BateriaEstadoSchema,
    painel: PainelEstadoSchema,
    id_subsistema: { type: Schema.Types.ObjectId as unknown as Types.ObjectId, required: true }
  },
  { timestamps: true }
);

export const Leitura = model('Leitura', LeituraSchema);