# 🚀 ShiftBox MVP - Monorepo

Plataforma de investimento e empréstimos peer-to-peer com pool de liquidez compartilhado.

## 📁 Estrutura do Projeto

```
shiftbox-mvp/
├─ backend/          # API FastAPI
├─ frontend/         # Admin Web (React + Vite)
├─ mobile/           # App Mobile (React Native + Expo)
└─ docs/             # Documentação
```

---

## 🛠️ Stack Tecnológica

### Backend
- **Framework:** FastAPI
- **ORM:** SQLAlchemy
- **Database:** PostgreSQL
- **Auth:** JWT (python-jose + passlib)
- **Migrations:** Alembic

### Frontend (Admin)
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS
- **State/Data:** React Query + Axios
- **Routing:** React Router v6

### Mobile (App)
- **Framework:** React Native (Expo)
- **Navigation:** React Navigation
- **HTTP Client:** Axios
- **Storage:** AsyncStorage
- **Styling:** NativeWind (Tailwind for RN)

---

## 🚀 Como Rodar o Projeto

### 📋 Pré-requisitos

- **Docker & Docker Compose** (para backend)
- **Node.js 18+** (para frontend e mobile)
- **npm ou yarn**

---

### 🔧 Backend (FastAPI)

```bash
# Navegar até a raiz do projeto
cd shiftbox-mvp

# Subir banco de dados e API
docker-compose up --build

# API estará rodando em: http://localhost:8000
# Docs interativas: http://localhost:8000/docs
```

**Credenciais de Teste:**
- Admin: `admin@shiftbox.com` / `admin123`
- Usuário: `user@shiftbox.com` / `user123`

---

### 💻 Frontend Web (Admin)

```bash
# Navegar até o diretório
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env
echo "VITE_API_URL=http://localhost:8000" > .env

# Rodar em modo desenvolvimento
npm run dev

# Frontend estará em: http://localhost:3000
```

**Build para Produção:**
```bash
npm run build
npm run preview
```

---

### 📱 Mobile (React Native)

```bash
# Navegar até o diretório
cd mobile

# Instalar dependências
npm install

# Iniciar Expo
npx expo start

# Opções:
# - Pressione 'w' para web
# - Pressione 'a' para Android (emulador ou dispositivo)
# - Pressione 'i' para iOS (apenas macOS)
# - Escaneie o QR Code com Expo Go (Android/iOS)
```

**⚠️ Nota sobre API no Mobile:**
- Para testar em dispositivo físico, altere `API_URL` em `mobile/screens/Login.tsx`
- Use o IP da sua máquina: `http://192.168.x.x:8000`

---

## 🌿 Estratégia de Branches

```
main          # Código em produção
dev           # Desenvolvimento integrado
feature/*     # Novas funcionalidades
bugfix/*      # Correções de bugs
hotfix/*      # Correções urgentes em produção
```

### 📝 Fluxo de Trabalho

1. **Criar branch a partir de `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/nome-da-feature
   ```

2. **Fazer commits atômicos:**
   ```bash
   git add .
   git commit -m "feat: adicionar autenticação JWT"
   ```

3. **Push e abrir Pull Request:**
   ```bash
   git push origin feature/nome-da-feature
   ```

4. **Code Review e Merge para `dev`**

5. **Deploy: `dev` → `main`**

---

## 📚 Documentação

- **API Contract:** [docs/api-contract.md](docs/api-contract.md)
- **API Docs (Swagger):** http://localhost:8000/docs
- **Redoc:** http://localhost:8000/redoc

---

## 🧪 Testando Localmente

### Backend
```bash
# Testar health check
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@shiftbox.com","password":"user123"}'
```

### Frontend
1. Acesse http://localhost:3000
2. Faça login com: `admin@shiftbox.com` / `admin123`
3. Navegue pelo dashboard

### Mobile
1. Inicie o Expo: `npx expo start`
2. Abra no Expo Go ou emulador
3. Faça login com: `user@shiftbox.com` / `user123`

---

## 🎯 Roadmap MVP

### ✅ Fase 1 - Estrutura Base (Atual)
- [x] Backend FastAPI com autenticação
- [x] Frontend React com dashboard
- [x] Mobile React Native com navegação
- [x] Docker Compose configurado
- [x] Documentação inicial

### 🚧 Fase 2 - Funcionalidades Core
- [ ] Sistema completo de carteira digital
- [ ] Investimento no pool
- [ ] Solicitação de empréstimos
- [ ] Cálculo automático de juros
- [ ] Sistema de transações

### 🔮 Fase 3 - Features Avançadas
- [ ] Dashboard analytics
- [ ] Notificações push
- [ ] Sistema de crédito score
- [ ] Integração com pagamentos
- [ ] KYC (Know Your Customer)

---

## 🤝 Contribuindo

### Convenção de Commits

```
feat:     Nova funcionalidade
fix:      Correção de bug
docs:     Documentação
style:    Formatação (sem mudança de código)
refactor: Refatoração
test:     Testes
chore:    Tarefas de build/config
```

**Exemplos:**
```bash
git commit -m "feat: adicionar endpoint de empréstimo"
git commit -m "fix: corrigir cálculo de juros"
git commit -m "docs: atualizar README com instruções"
```

---

## 📦 Deploy (Futuro)

### Backend
- **Recomendado:** Railway, Render, Fly.io
- **Database:** Supabase, Neon, RDS

### Frontend
- **Recomendado:** Vercel, Netlify

### Mobile
- **iOS:** App Store Connect
- **Android:** Google Play Console
- **OTA Updates:** Expo EAS Update

---

## 🐛 Troubleshooting

### Backend não inicia
```bash
# Verificar se as portas estão em uso
docker-compose down
docker-compose up --build --force-recreate
```

### Frontend não conecta à API
```bash
# Verificar .env
cat frontend/.env

# Deve conter:
# VITE_API_URL=http://localhost:8000
```

### Mobile não conecta à API
- Em emulador: use `http://localhost:8000`
- Em dispositivo físico: use `http://SEU_IP:8000`
- Verifique firewall e rede local

---

## 📧 Contato

Para dúvidas ou sugestões:
- **Email:** dev@shiftbox.com
- **Docs:** [docs/api-contract.md](docs/api-contract.md)

---

## 📄 Licença

Este projeto é um MVP para hackathon/desenvolvimento interno.

---

**Desenvolvido com ❤️ pela equipe ShiftBox**

