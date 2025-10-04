# 🚀 Como Usar o ShiftBox MVP

## 📱 Abrir no Navegador

O navegador deve ter aberto automaticamente com:
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs

Se não abriu, clique nos links acima.

---

## 🔐 Fazer Login no Frontend

1. Acesse: http://localhost:3000
2. Use as credenciais:
   - **Email:** `admin@shiftbox.com`
   - **Senha:** `admin123`
3. Clique em **"Entrar"**
4. Você será redirecionado para o Dashboard

---

## 📊 Explorar o Dashboard

No Dashboard você verá:
- **4 Cards** com estatísticas do pool
- **Tabela** com usuários mockados
- **Botão Sair** no canto superior direito

---

## 📱 Testar o Mobile

### Opção 1 - No Navegador (Mais Fácil)
1. Vá para a janela do PowerShell que mostra "Expo Dev Tools"
2. Pressione a tecla **`w`**
3. O app abrirá no navegador
4. Faça login com:
   - **Email:** `user@shiftbox.com`
   - **Senha:** `user123`

### Opção 2 - No Celular
1. Instale o app **Expo Go** (Android/iOS)
2. Abra o Expo Go
3. Escaneie o QR Code que aparece no terminal
4. App abrirá automaticamente

---

## 🔍 Testar a API

### Via Swagger (Recomendado)
1. Acesse: http://localhost:8000/docs
2. Clique em **"POST /auth/login"**
3. Clique em **"Try it out"**
4. Digite:
   ```json
   {
     "email": "admin@shiftbox.com",
     "password": "admin123"
   }
   ```
5. Clique em **"Execute"**
6. Você receberá um token JWT

### Testar Pool
1. Na mesma página, clique em **"GET /pool"**
2. Clique em **"Try it out"**
3. Clique em **"Execute"**
4. Verá os dados do pool:
   ```json
   {
     "saldo_total": 1000000.0,
     "saldo_disponivel": 650000.0,
     "saldo_emprestado": 350000.0,
     "percentual_utilizacao": 35.0,
     "total_investidores": 45
   }
   ```

---

## 🛑 Parar os Serviços

Para parar todos os serviços:
1. Feche as **3 janelas do PowerShell** que foram abertas:
   - Janela do Backend
   - Janela do Frontend  
   - Janela do Mobile (Expo)

Ou pressione **Ctrl+C** em cada janela.

---

## 🔄 Reiniciar os Serviços

Se precisar reiniciar:

### Backend
```powershell
cd backend
.\start.bat
```

### Frontend
```powershell
cd frontend
npm run dev
```

### Mobile
```powershell
cd mobile
npx expo start
```

---

## 🐛 Problemas Comuns

### Backend não responde
```powershell
# Verificar se está rodando
Invoke-RestMethod http://localhost:8000/health

# Se não funcionar, reinicie:
cd backend
.\start.bat
```

### Frontend não carrega
```powershell
# Verificar .env
cat frontend\.env

# Deve mostrar:
# VITE_API_URL=http://localhost:8000

# Reiniciar:
cd frontend
npm run dev
```

### Mobile não conecta à API
Se estiver testando em **celular físico**:
1. Edite `mobile/screens/Login.tsx`
2. Na linha 14, troque `localhost` pelo IP da sua máquina:
   ```typescript
   const API_URL = 'http://192.168.X.X:8000';
   ```
3. Descubra seu IP:
   ```powershell
   ipconfig | findstr IPv4
   ```

---

## 📚 Documentação Adicional

- **API Endpoints:** `docs/api-contract.md`
- **Setup Completo:** `docs/SETUP.md`
- **README Geral:** `README.md`
- **Status Inicial:** `STATUS-INICIAL.md`

---

## 💡 Dicas

1. **Mantenha as 3 janelas do PowerShell abertas** enquanto desenvolve
2. **Use Ctrl+C** para parar um serviço
3. **Consulte os logs** nas janelas do PowerShell para debug
4. **Hot Reload está ativo:** alterações no código recarregam automaticamente

---

## ✨ Próximos Passos

1. ✅ Teste todas as funcionalidades
2. 📝 Leia a documentação da API
3. 🌿 Crie sua branch de desenvolvimento:
   ```bash
   git checkout -b feature/sua-feature
   ```
4. 💻 Comece a desenvolver!

---

**Bom desenvolvimento! 🚀**

