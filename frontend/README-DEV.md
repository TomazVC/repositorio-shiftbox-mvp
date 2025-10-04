# 🌐 ShiftBox - Frontend Web Admin

Painel administrativo web para gerenciar o ecossistema ShiftBox.

## 🚀 Tecnologias

- **React 18** + **TypeScript**
- **Vite** (build tool)
- **TailwindCSS** (estilização)
- **React Router** (navegação)
- **React Query** (gerenciamento de estado)
- **Axios** (requisições HTTP)

## 📁 Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   ├── Card.tsx
│   │   ├── Layout.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/          # Páginas da aplicação
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Users.tsx
│   │   ├── Investments.tsx
│   │   └── Loans.tsx
│   ├── hooks/          # Custom hooks
│   │   └── useApi.ts
│   ├── App.tsx
│   └── main.tsx
```

## 🎨 Páginas Implementadas

- ✅ **Login** - Autenticação de administradores
- ✅ **Dashboard** - Visão geral do pool (métricas principais)
- ✅ **Usuários** - Gerenciamento de usuários e status KYC
- ✅ **Investimentos** - Listagem de investimentos no pool
- ✅ **Empréstimos** - Gerenciamento de empréstimos (aprovar/rejeitar)

## 🛠️ Como Rodar

Siga os passos abaixo para rodar o projeto localmente.

## ⚙️ Configuração

1. **Configure a URL da API**
   
   O arquivo `.env` já está configurado com:
   ```
   VITE_API_URL=http://localhost:8000
   ```

2. **Certifique-se que o backend está rodando**
   
   O frontend precisa do backend rodando na porta 8000.

## 🔥 Status Atual

### ✅ Já Funciona
- Login com JWT
- Dashboard com dados do pool (integrado com API)
- Sidebar com navegação completa
- Rotas protegidas (redirect para login se não autenticado)
- 4 páginas completas com dados mockados

### 🚧 Próximos Passos
- Integrar páginas com API real (quando endpoints estiverem prontos)
- Adicionar modais de edição
- Implementar CRUD completo de usuários
- Adicionar gráficos (Recharts ou Chart.js)
- Melhorar feedback visual (toasts, loading states)

## 🎯 Endpoints Esperados do Backend

O frontend está preparado para consumir:

```
POST /auth/login          # ✅ Funcionando
GET  /pool                # ✅ Funcionando
GET  /users               # 🚧 Aguardando backend
GET  /investments         # 🚧 Aguardando backend
GET  /loans               # 🚧 Aguardando backend
POST /loans/:id/approve   # 🚧 Aguardando backend
POST /loans/:id/reject    # 🚧 Aguardando backend
```

## 🔐 Credenciais de Teste

```
Email: admin@shiftbox.com
Senha: admin123
```

## 📝 Notas de Desenvolvimento

- Todos os dados (exceto Dashboard) estão **mockados** por enquanto
- A integração com API será feita quando endpoints estiverem prontos
- O código está preparado com comentários `// TODO:` indicando onde integrar
- Design responsivo e pronto para produção

