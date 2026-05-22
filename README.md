# FinTrack — Gestão Financeira Pessoal

Sistema full-stack de controle financeiro pessoal com Go (Gin) + React (Vite + Tailwind).

---

## 🗂️ Estrutura do Monorepo

```
fintrack/
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go          # Entry point, rotas e CORS
│   ├── internal/
│   │   ├── database/
│   │   │   └── database.go      # Init SQLite + migrations + seed
│   │   ├── handlers/
│   │   │   ├── dashboard.go     # GET /api/v1/dashboard
│   │   │   ├── accounts.go      # CRUD /api/v1/accounts
│   │   │   ├── transactions.go  # CRUD /api/v1/transactions
│   │   │   └── debts.go         # CRUD + /pay /api/v1/debts
│   │   └── models/
│   │       └── models.go        # Structs (Account, Transaction, Debt...)
│   ├── go.mod
│   └── Makefile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Card.tsx     # StatCard + Card reutilizáveis
│   │   │   │   ├── Modal.tsx    # Modal genérico (ESC p/ fechar)
│   │   │   │   └── Layout.tsx   # Sidebar + Outlet
│   │   │   ├── transactions/
│   │   │   │   ├── TransactionRow.tsx
│   │   │   │   └── NewTransactionModal.tsx
│   │   │   └── debts/
│   │   │       └── NewDebtModal.tsx
│   │   ├── hooks/
│   │   │   └── useFinTrack.ts   # Todos os React Query hooks
│   │   ├── lib/
│   │   │   ├── api.ts           # Axios client + funções de API
│   │   │   ├── types.ts         # Interfaces TypeScript (≈ Go models)
│   │   │   └── utils.ts         # formatCurrency, formatDate, cn...
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TransactionsPage.tsx
│   │   │   ├── DebtsPage.tsx
│   │   │   └── AccountsPage.tsx
│   │   ├── App.tsx              # Router + QueryClientProvider
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind + custom components
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts           # Proxy /api → :8080
│   ├── tailwind.config.js
│   └── tsconfig.json
│
└── README.md
```

---

## 🚀 Como rodar

### Pré-requisitos
- Go 1.22+
- Node.js 18+
- gcc (para compilar `go-sqlite3`)

### Backend

```bash
cd backend

# Instalar dependências
go mod tidy

# Rodar em modo dev (cria fintrack.db com dados de exemplo)
make dev

# ou diretamente
go run ./cmd/server/main.go
```

A API estará em `http://localhost:8080`

### Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar em dev (proxy /api → :8080)
npm run dev
```

O app estará em `http://localhost:5173`

---

## 📡 Endpoints da API

| Método | Rota                          | Descrição                        |
|--------|-------------------------------|----------------------------------|
| GET    | `/api/v1/dashboard`           | Visão geral (KPIs + listas)      |
| GET    | `/api/v1/accounts`            | Listar contas                    |
| POST   | `/api/v1/accounts`            | Criar conta                      |
| PUT    | `/api/v1/accounts/:id`        | Atualizar conta                  |
| DELETE | `/api/v1/accounts/:id`        | Deletar conta                    |
| GET    | `/api/v1/transactions`        | Listar transações (com filtros)  |
| POST   | `/api/v1/transactions`        | Criar transação (atualiza saldo) |
| DELETE | `/api/v1/transactions/:id`    | Deletar (reverte saldo)          |
| GET    | `/api/v1/debts`               | Listar dívidas                   |
| POST   | `/api/v1/debts`               | Criar dívida                     |
| PUT    | `/api/v1/debts/:id`           | Atualizar dívida                 |
| DELETE | `/api/v1/debts/:id`           | Deletar dívida                   |
| POST   | `/api/v1/debts/:id/pay`       | Registrar pagamento de parcela   |

### Filtros em `/api/v1/transactions`
- `?type=income|expense`
- `?account_id=1`
- `?from=2024-01-01&to=2024-01-31`

---

## 🧱 Stack

| Camada   | Tecnologia                                        |
|----------|---------------------------------------------------|
| API      | Go 1.22 + Gin + SQLite (go-sqlite3, WAL mode)     |
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS       |
| Dados    | TanStack Query (cache, retry, invalidation)       |
| Gráficos | Recharts (BarChart + PieChart)                    |
| Roteamento | React Router v6                                 |

---

## 📋 Próximos Passos Sugeridos

- [ ] Autenticação (JWT) para múltiplos usuários
- [ ] Exportar relatórios em PDF/CSV
- [ ] Notificações de vencimento de dívidas
- [ ] Metas de economia (savings goals)
- [ ] PWA / modo offline
- [ ] Docker Compose para deploy simplificado
