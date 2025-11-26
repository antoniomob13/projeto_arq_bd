import { Schema, model } from 'mongoose';

const EnderecoSchema = new Schema(
  {
    rua: String,
    numero: String,
    bairro: String,
    cidade: String,
    estado: String,
    cep: String
  },
  { _id: false }
);

const ClienteSchema = new Schema(
  {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    tipo: { type: String, enum: ['admin', 'cliente'], default: 'cliente' },
    telefone: String,
    cpf_cnpj: String,
    tipo_pessoa: { type: String, enum: ['fisica', 'juridica'], default: 'fisica' },
    endereco: EnderecoSchema,
    sistema_id: { type: Schema.Types.ObjectId, ref: 'Sistema', default: null },
    ativo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Cliente = model('Cliente', ClienteSchema);
