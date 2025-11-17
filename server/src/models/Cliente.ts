import { Schema, model, Types } from 'mongoose';

const EnderecoSchema = new Schema(
  {
    rua: String,
    bairro: String,
    complemento: String,
    cep: String,
    cidade: String,
    estado: String
  },
  { _id: false }
);

const ClienteSchema = new Schema(
  {
    nome: { type: String, required: true },
    cpf_cnpj: { type: String, required: true, unique: true, index: true },
    tipo_pessoa: { type: String, enum: ['F', 'J'], required: true },
    data_nasc: Date,
    telefone: String,
    email: String,
    endereco: EnderecoSchema,
    sistemas: [
      {
        id_sistema: { type: Schema.Types.ObjectId as unknown as Types.ObjectId, ref: 'Sistema' }
      }
    ]
  },
  { timestamps: true }
);

ClienteSchema.index({ cpf_cnpj: 1 }, { unique: true });

export const Cliente = model('Cliente', ClienteSchema);