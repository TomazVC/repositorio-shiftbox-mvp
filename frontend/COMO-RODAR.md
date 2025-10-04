# 🚀 PASSO A PASSO - Como Rodar o Frontend Web

## 📋 Pré-requisitos

- **Node.js** versão 16 ou superior
- **npm** ou **yarn**
- **Backend rodando** na porta 8000

---

## 🔧 PASSO 1: Instalar Dependências

Abra o terminal na pasta `frontend/` e execute:

```bash
npm install
```

**Aguarde a instalação de todas as dependências.**

---

## ⚙️ PASSO 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `frontend/` com o seguinte conteúdo:

```env
VITE_API_URL=http://localhost:8000
```

**Obs:** Certifique-se de que o backend está rodando nesta URL!

---

## ▶️ PASSO 3: Rodar o Servidor de Desenvolvimento

No terminal, execute:

```bash
npm run dev
```

Você verá algo assim:

```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

---

## 🌐 PASSO 4: Acessar a Aplicação

Abra seu navegador e acesse:

```
http://localhost:5173
```

---

## 🔐 PASSO 5: Fazer Login

Use as credenciais de teste:

```
Email: admin@shiftbox.com
Senha: admin123
```

**Obs:** Essas credenciais devem estar configuradas no backend!

---

## ✅ PASSO 6: Testar as Funcionalidades

Após o login, você será redirecionado para o **Dashboard**.

### Navegue pelas páginas:

1. **📊 Dashboard** - Visualize métricas do pool (integrado com backend)
2. **👥 Usuários** - Veja a lista de usuários com status KYC (mockado)
3. **💰 Investimentos** - Veja investimentos no pool (mockado)
4. **🏦 Empréstimos** - Gerencie empréstimos (mockado)

---

## 🐛 Solução de Problemas

### ❌ Erro: "Failed to fetch"

**Causa:** Backend não está rodando ou URL incorreta.

**Solução:**
1. Verifique se o backend está rodando em `http://localhost:8000`
2. Teste acessando `http://localhost:8000/docs` no navegador
3. Verifique o arquivo `.env` na pasta `frontend/`

---

### ❌ Erro: "Login failed" / "401 Unauthorized"

**Causa:** Credenciais incorretas ou JWT não configurado no backend.

**Solução:**
1. Verifique se o backend aceita `admin@shiftbox.com` / `admin123`
2. Verifique se o backend está retornando um token JWT válido
3. Abra o **DevTools** (F12) → **Console** e veja erros

---

### ❌ Página em branco após login

**Causa:** Problema com rotas ou token.

**Solução:**
1. Abra o **DevTools** (F12) → **Console**
2. Veja se há erros no console
3. Verifique o **localStorage** (Application → Local Storage)
4. Deve ter as chaves: `token` e `user_email`

---

## 📦 Scripts Disponíveis

```bash
npm run dev      # Roda servidor de desenvolvimento
npm run build    # Compila para produção
npm run preview  # Preview da build de produção
npm run lint     # Verifica erros de código
```

---

## 🎯 Estrutura Implementada

### ✅ Componentes Criados
- `Layout.tsx` - Layout com sidebar e header
- `ProtectedRoute.tsx` - Proteção de rotas autenticadas
- `Card.tsx` - Card reutilizável para métricas

### ✅ Páginas Criadas
- `Login.tsx` - Login com integração JWT
- `Dashboard.tsx` - Dashboard com dados do pool (integrado com API)
- `Users.tsx` - Listagem de usuários com KYC
- `Investments.tsx` - Listagem de investimentos
- `Loans.tsx` - Gestão de empréstimos

### ✅ Hooks
- `useApi.ts` - Hook para requisições HTTP com Axios + JWT

---

## 🔗 Endpoints Consumidos

| Endpoint | Método | Status | Descrição |
|----------|--------|--------|-----------|
| `/auth/login` | POST | ✅ Funcionando | Login de admin |
| `/pool` | GET | ✅ Funcionando | Dados do pool |
| `/users` | GET | 🚧 Mock | Lista de usuários |
| `/investments` | GET | 🚧 Mock | Lista de investimentos |
| `/loans` | GET | 🚧 Mock | Lista de empréstimos |

**Obs:** Páginas com dados mockados serão integradas quando o backend implementar os endpoints.

---

## 🎨 Design System

### Cores Principais
- **Primary Blue:** `#0ea5e9`
- **Success Green:** `#10b981`
- **Warning Yellow:** `#f59e0b`
- **Danger Red:** `#ef4444`

### Componentes TailwindCSS
- Cards com bordas coloridas
- Tabelas responsivas
- Badges para status
- Sidebar fixa com navegação

---

## 📸 Como Testar para o Pitch

1. **Login** - Mostre a tela de login limpa e profissional
2. **Dashboard** - Destaque os 4 cards principais com métricas do pool
3. **Usuários** - Mostre a gestão de usuários com status KYC
4. **Investimentos** - Mostre investimentos ativos e resgatados
5. **Empréstimos** - Mostre empréstimos pendentes e ações (Aprovar/Rejeitar)

---

## 🚀 Próximos Passos

- [ ] Integrar API real para Usuários, Investimentos e Empréstimos
- [ ] Adicionar modais de edição/criação
- [ ] Implementar gráficos (Recharts)
- [ ] Adicionar toasts para feedback de ações
- [ ] Melhorar loading states
- [ ] Adicionar filtros e busca nas tabelas

---

## 💡 Dicas

- Use **F12** para abrir o DevTools e debugar
- Verifique o **Console** para ver logs de erro
- Verifique o **Network** para ver requisições HTTP
- Use o **React DevTools** para debugar componentes

---

**✅ Tudo pronto! O frontend está rodando e integrado com o backend.**

Se tiver problemas, verifique:
1. Backend rodando na porta 8000
2. CORS habilitado no backend
3. Arquivo `.env` configurado corretamente

