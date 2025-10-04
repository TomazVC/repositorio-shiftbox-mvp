# ⚡ INÍCIO RÁPIDO - Frontend ShiftBox

## 🎯 Comandos para Rodar (copie e cole)

### 1️⃣ Instalar dependências
```bash
cd frontend
npm install
```

### 2️⃣ Criar arquivo .env
```bash
echo VITE_API_URL=http://localhost:8000 > .env
```

**Se estiver no Windows PowerShell:**
```powershell
"VITE_API_URL=http://localhost:8000" | Out-File -FilePath .env -Encoding utf8
```

### 3️⃣ Rodar o servidor
```bash
npm run dev
```

### 4️⃣ Acessar no navegador
```
http://localhost:5173
```

### 5️⃣ Login
```
Email: admin@shiftbox.com
Senha: admin123
```

---

## ✅ O que está funcionando

- ✅ **Login** → Integrado com backend
- ✅ **Dashboard** → Cards do pool com dados reais da API
- ✅ **Usuários** → Lista com KYC status (mockado)
- ✅ **Investimentos** → Lista de investimentos (mockado)
- ✅ **Empréstimos** → Lista com ações (mockado)
- ✅ **Sidebar** → Navegação completa entre páginas
- ✅ **Rotas Protegidas** → Redirect para login se não autenticado

---

## 🔧 Checklist Pré-Requisitos

Antes de rodar, certifique-se:

- [ ] Node.js 16+ instalado (`node -v`)
- [ ] Backend rodando em `http://localhost:8000`
- [ ] Backend com CORS habilitado
- [ ] Endpoint `/auth/login` funcionando
- [ ] Endpoint `/pool` funcionando

---

## 📁 Arquivos Criados

```
frontend/src/
├── components/
│   ├── Card.tsx            ✅ Componente de card reutilizável
│   ├── Layout.tsx          ✅ Layout com sidebar + header
│   └── ProtectedRoute.tsx  ✅ Proteção de rotas
├── pages/
│   ├── Dashboard.tsx       ✅ Dashboard com métricas do pool
│   ├── Login.tsx           ✅ Já existia (login funcional)
│   ├── Users.tsx           ✅ Gerenciamento de usuários
│   ├── Investments.tsx     ✅ Gestão de investimentos
│   └── Loans.tsx           ✅ Gestão de empréstimos
└── hooks/
    └── useApi.ts           ✅ Já existia (Axios + JWT)
```

---

## 🐛 Problemas Comuns

### ❌ "Failed to fetch"
**Solução:** Verifique se o backend está rodando em `http://localhost:8000`

### ❌ "CORS error"
**Solução:** Habilite CORS no backend para `http://localhost:5173`

### ❌ Login não funciona
**Solução:** Verifique se as credenciais estão no backend

### ❌ Página em branco
**Solução:** Abra F12 → Console e veja erros

---

## 📊 Estrutura Visual

```
┌─────────────────────────────────────────────────────┐
│  ShiftBox                                    [Admin] │
├───────────┬─────────────────────────────────────────┤
│           │                                          │
│ 📊 Dash   │  Dashboard                               │
│ 👥 Users  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│ 💰 Invest │  │Saldo │ │Disp. │ │Empr. │ │Util. │   │
│ 🏦 Loans  │  │Total │ │      │ │      │ │      │   │
│           │  └──────┘ └──────┘ └──────┘ └──────┘   │
│           │                                          │
│ 🚪 Sair   │  [Conteúdo da página aqui]             │
│           │                                          │
└───────────┴─────────────────────────────────────────┘
```

---

## 🎯 Para o Pitch

**Screenshots importantes:**
1. Tela de Login (limpa e profissional)
2. Dashboard com 4 cards do pool
3. Página de Usuários com KYC
4. Página de Empréstimos com botões de Aprovar/Rejeitar

**Fluxo para demonstrar:**
1. Login → Dashboard
2. Navegar pelo Sidebar
3. Mostrar dados mockados com UI profissional
4. Explicar que dados serão reais quando backend implementar endpoints

---

## 🚀 Pronto!

Execute os comandos acima e o frontend estará rodando!

**Dúvidas?** Veja o arquivo `COMO-RODAR.md` para detalhes completos.

