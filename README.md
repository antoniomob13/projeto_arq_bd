# Monitoring Dashboard (React + Vite)

Interface de monitoramento em tempo real com React + TypeScript, Chakra UI e Recharts. Dados são simulados no cliente.

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
