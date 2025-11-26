# Monitoring Dashboard (React + Vite)

Interface de monitoramento em tempo real com React + TypeScript, Chakra UI e Recharts. Dados são simulados no navegador.

## Requisitos
- Node.js 18+

## Como rodar (Windows PowerShell)
```powershell
# Instalar dependências
npm install

# Ambiente de desenvolvimento
npm run dev

# Build de produção
npm run build

# Pré-visualização do build
npm run preview
```

## Estrutura
- `src/components` — Cartões de métricas, gráfico em tempo real e tabela de alertas
- `src/pages/Dashboard.tsx` — Tela principal
- `src/services/dataService.ts` — Serviço de dados simulados (intervalo de 1s)
- `src/theme.ts` — Tema do Chakra UI

## Customização
- Ajuste o `dataService` para consumir sua API/WebSocket real.
- Adicione filtros/períodos conforme necessário.

## Sistema prioritário de teste
Use o script de seed do backend para criar rapidamente um sistema marcado como prioritário (status "Alerta") para fins de demonstração.

1. Configure a variável `MONGODB_URI` apontando para o cluster MongoDB desejado.
2. Instale as dependências da API: `cd server; npm install`.
3. Execute o seed: `npm run seed:priority` (a partir da pasta `server`).

O script garante a existência de um registro chamado "Sistema Prioritário Teste" com `prioridade_teste = true` e `status_operacional = "Alerta crítico"`. Esse registro aparece automaticamente nos painéis de prioridade do front-end para validações rápidas.
