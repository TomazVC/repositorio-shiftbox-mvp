# ShiftBox MVP - Monorepo

Plataforma MVP para gestao de investimentos e emprestimos P2P com pool compartilhado de liquidez.

## Estrutura do projeto

```
shiftbox-mvp/
|-- backend/    # API FastAPI + SQLAlchemy
|-- frontend/   # Painel admin (React + Vite)
|-- mobile/     # App mobile (React Native + Expo)
`-- docs/       # Documentacao auxiliar
```

---

## Stack

### Backend
- FastAPI 0.104
- SQLAlchemy 2.x + Alembic
- SQLite local (desenvolvimento) / PostgreSQL futuro
- Autenticacao JWT (python-jose + passlib/bcrypt)
- Calculos financeiros com `Decimal` (ROUND_HALF_EVEN)
- Job diario de accrual (`python accrual_job.py`)

### Frontend
- React 18 + Vite + TypeScript
- TailwindCSS, React Query, Axios

### Mobile
- React Native (Expo) + TypeScript
- React Navigation, Axios, AsyncStorage

---

## Como rodar o backend

```powershell
cd backend

# criar/atualizar o ambiente virtual e instalar dependencias
.\setup.ps1

# em cada nova sessao PowerShell
.\venv\Scripts\Activate.ps1
$env:USE_SQLITE = "true"   # garante uso do banco local

# aplicar migrations
.\venv\Scripts\alembic.exe upgrade head

# popular dados de teste (opcional)
$env:PYTHONIOENCODING = "utf-8"
.\venv\Scripts\python.exe seed_data.py

# subir API
py -m uvicorn app.main:app --reload
```

API: `http://127.0.0.1:8000`
Swagger: `http://127.0.0.1:8000/docs`

### Autenticacao

Fluxo OAuth2 password:
1. Cadastre um usuario real em `POST /auth/register` (payload `UserCreate`).
2. Faca login em `POST /auth/login` (username = email, password = senha).
3. Anote o token JWT retornado.
4. No Swagger clique em **Authorize** e informe username/senha (ou `Bearer <token>` manualmente).
5. Consulte `GET /auth/me` para validar o usuario autenticado.

### Endpoints principais

| Recurso | Operacoes | Observacoes |
|---------|-----------|-------------|
| `/auth` | register, login, me | JWT valido por 30 minutos |
| `/users` | CRUD + status | acoes administrativas exigem usuario admin |
| `/wallets` | CRUD + historico | delete exige saldo zero e sem historico |
| `/investments` | CRUD + preview/schedule/resgate | calculo composto com Decimal e reprocessamento da fila |
| `/loans` | CRUD + preview/schedule + fila automatica | emprestimos >80% entram em fila; juros diários acumulados via job |
| `/transactions` | CRUD | delete reverte impacto no saldo |
| `/kyc` | upload, listar e revisar documentos | revisao exige usuario admin |
| `/pool` | status do pool | mostra utilizacao, fila e limite de 80% |

**Regra do Pool:**
- Utilizacao calculada em tempo real com base nos investimentos ativos e emprestimos pendentes/ativos.
- Quando a utilizacao ultrapassa 80%, novos emprestimos sao colocados em fila (`status = "fila"`).
- A cada aporte, resgate ou pagamento de emprestimo, a fila e reprocessada automaticamente.
- `accrual_job.py` contabiliza diariamente os juros de investimentos/emprestimos e gera `Transactions` (`rendimento_acumulado`, `juros_acumulado`) de forma idempotente.

### Job diario (accrual)

```powershell
# executar manualmente
.\venv\Scripts\Activate.ps1
$env:USE_SQLITE = "true"
python accrual_job.py
```

O job analisa investimentos ativos e emprestimos pendentes/ativos, calcula os juros dos dias decorridos (Decimal) e grava Transactions de auditoria. Campos `last_accrual_at` e `interest_accrued` evitam recalculo do mesmo periodo.

---

## Como rodar o frontend (admin)

```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:3000`. Configure `VITE_API_URL` no `.env` se necessario.

## Como rodar o mobile

```bash
cd mobile
npm install
npx expo start
```
Use Expo Go ou emulador. Ajuste a constante de API para o IP da maquina ao testar em dispositivo fisico.

---

## Testes rapidos

```bash
# health check
curl http://127.0.0.1:8000/health

# login (form data)
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=joao.autenticado@example.com&password=Senha@123"

# preview de investimento
curl -X POST http://127.0.0.1:8000/investments/preview \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"valor": "10000", "taxa_rendimento": "0.12", "dias": 90, "tipo": "composto"}'

# cronograma de emprestimo
curl http://127.0.0.1:8000/loans/1/schedule \
  -H "Authorization: Bearer <TOKEN>"

# job de juroscd backend
python accrual_job.py
```

---

## Roadmap (MVP)

- [x] Modelagem completa (users, wallets, transactions, investments, loans)
- [x] Migrations Alembic e scripts de seed/inspect
- [x] CRUDs e regras basicas (resgate, limite 80%, cancelamentos)
- [x] Autenticacao real com JWT
- [x] Fila automatica de emprestimos (>80% pool)
- [x] Upload/listagem/revisao de documentos KYC
- [x] Calculos financeiros (preview, cronogramas, APY, PRICE/SAC)
- [x] Job diario de accrual (interest_accrual transactions)
- [ ] Migracao para PostgreSQL e ambiente Docker
- [ ] Testes automatizados e cobertura de regras de negocio
- [ ] Ajustes finais de UX no front e mobile

---

## Troubleshooting

- **ModuleNotFoundError psycopg2**: use `$env:USE_SQLITE="true"` ou instale `psycopg2-binary` ao utilizar PostgreSQL.
- **Caracteres corrompidos no console**: defina `PYTHONIOENCODING=utf-8` antes dos scripts que imprimem emoji.
- **Swagger nao autentica**: o login usa fluxo password; informe username/senha no modal ou gere o token via `curl`.

---

## Licenca

Projeto MVP voltado a demonstracao interna. Uso restrito ao time ShiftBox.

