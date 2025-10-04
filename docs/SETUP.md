# 🔧 Guia de Configuração - ShiftBox MVP

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker Desktop** (para Windows/Mac) ou **Docker Engine** (para Linux)
- **Node.js 18+** e npm
- **Git**
- **Editor de código** (VS Code recomendado)

### Verificando Instalações

```bash
# Docker
docker --version
docker-compose --version

# Node.js
node --version
npm --version

# Git
git --version
```

---

## 🚀 Setup Inicial

### 1️⃣ Clonar o Repositório

```bash
git clone <url-do-repositorio>
cd shiftbox-mvp
```

### 2️⃣ Backend Setup

```bash
# Criar arquivo .env (opcional para desenvolvimento local)
cd backend
cp .env.example .env

# Voltar para raiz
cd ..

# Iniciar serviços com Docker
docker-compose up --build

# Em outro terminal, verificar se está funcionando
curl http://localhost:8000/health
```

**Resultado esperado:**
```json
{"status": "healthy"}
```

### 3️⃣ Frontend Setup

```bash
# Navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Criar arquivo .env
echo "VITE_API_URL=http://localhost:8000" > .env

# Iniciar servidor de desenvolvimento
npm run dev
```

**Acesse:** http://localhost:3000

### 4️⃣ Mobile Setup

```bash
# Navegar para o mobile
cd mobile

# Instalar dependências
npm install

# Iniciar Expo
npx expo start
```

**Opções:**
- Pressione `w` para abrir no navegador
- Pressione `a` para Android (emulador)
- Pressione `i` para iOS (apenas macOS)
- Escaneie QR Code com **Expo Go** app

---

## 🔐 Credenciais de Teste

### Admin (Frontend)
- **Email:** admin@shiftbox.com
- **Senha:** admin123

### Usuário (Mobile)
- **Email:** user@shiftbox.com
- **Senha:** user123

---

## 🐛 Problemas Comuns

### ❌ Erro: "Port 8000 already in use"

**Solução:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill -9
```

### ❌ Erro: "Cannot connect to Docker daemon"

**Solução:**
- Verifique se o Docker Desktop está rodando
- Reinicie o Docker Desktop
- No Linux: `sudo systemctl start docker`

### ❌ Frontend não carrega dados

**Solução:**
```bash
# Verificar se backend está rodando
curl http://localhost:8000/health

# Verificar .env do frontend
cat frontend/.env

# Deve conter:
# VITE_API_URL=http://localhost:8000
```

### ❌ Mobile não conecta à API em dispositivo físico

**Solução:**
1. Descubra seu IP local:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig | grep "inet "
   ```

2. Edite `mobile/screens/Login.tsx`:
   ```typescript
   const API_URL = 'http://192.168.x.x:8000'; // Seu IP
   ```

3. Certifique-se de que o dispositivo está na mesma rede Wi-Fi

---

## 📦 Dependências Principais

### Backend
```txt
fastapi==0.104.1          # Framework web
uvicorn==0.24.0           # Servidor ASGI
sqlalchemy==2.0.23        # ORM
psycopg2-binary==2.9.9    # Driver PostgreSQL
python-jose==3.3.0        # JWT
passlib==1.7.4            # Hash de senhas
```

### Frontend
```json
{
  "react": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@tanstack/react-query": "^5.12.2",
  "axios": "^1.6.2",
  "tailwindcss": "^3.3.6"
}
```

### Mobile
```json
{
  "expo": "~49.0.15",
  "react-native": "0.72.6",
  "@react-navigation/native": "^6.1.9",
  "axios": "^1.6.2",
  "nativewind": "^2.0.11"
}
```

---

## 🧹 Limpeza e Reset

### Limpar containers Docker
```bash
docker-compose down -v
docker-compose up --build
```

### Limpar node_modules
```bash
# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install

# Mobile
cd mobile
rm -rf node_modules package-lock.json
npm install
```

---

## 🎯 Próximos Passos

1. ✅ Configure o ambiente local
2. ✅ Teste todos os serviços
3. ✅ Faça login no frontend e mobile
4. 📖 Leia a documentação da API: [docs/api-contract.md](api-contract.md)
5. 🌿 Crie sua branch de feature: `git checkout -b feature/minha-feature`
6. 💻 Comece a desenvolver!

---

## 📚 Recursos Adicionais

- **FastAPI Docs:** https://fastapi.tiangolo.com/
- **React Query:** https://tanstack.com/query/latest
- **React Navigation:** https://reactnavigation.org/
- **Expo Docs:** https://docs.expo.dev/
- **TailwindCSS:** https://tailwindcss.com/docs

---

**Boa sorte no desenvolvimento! 🚀**

