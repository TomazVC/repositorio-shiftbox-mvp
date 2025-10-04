# 📄 Contrato de API - ShiftBox

## Base URL
```
http://localhost:8000
```

## 🔐 Autenticação

### POST /auth/login
Autentica um usuário e retorna um token JWT.

**Request:**
```json
{
  "email": "user@shiftbox.com",
  "password": "user123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 2,
  "email": "user@shiftbox.com"
}
```

**Response (401):**
```json
{
  "detail": "Email ou senha incorretos"
}
```

**Credenciais de Teste:**
- Admin: `admin@shiftbox.com` / `admin123`
- Usuário: `user@shiftbox.com` / `user123`

---

### POST /auth/register
Registra um novo usuário (MVP - Simulado).

**Request:**
```json
{
  "email": "novousuario@shiftbox.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "message": "Usuário registrado com sucesso",
  "email": "novousuario@shiftbox.com"
}
```

---

## 💰 Pool de Investimentos

### GET /pool
Retorna informações sobre o pool de investimentos.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
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

## 📊 Status Codes

| Código | Descrição |
|--------|-----------|
| 200 | Requisição bem-sucedida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 422 | Erro de validação |
| 500 | Erro interno do servidor |

---

## 🚀 Próximas Funcionalidades (Roadmap)

- [ ] `POST /investment` - Criar investimento
- [ ] `GET /investment/{id}` - Obter detalhes do investimento
- [ ] `POST /loan/request` - Solicitar empréstimo
- [ ] `GET /loan/{id}` - Obter detalhes do empréstimo
- [ ] `GET /wallet` - Obter saldo da carteira
- [ ] `GET /transactions` - Listar transações
- [ ] `POST /wallet/withdraw` - Sacar da carteira
- [ ] `POST /wallet/deposit` - Depositar na carteira

---

## 📝 Notas de Implementação

### Autenticação JWT
- Token expira em 30 minutos
- Incluir token no header: `Authorization: Bearer {token}`
- Para MVP, tokens são gerados sem validação de banco de dados

### Dados Mock (MVP)
- Todos os endpoints usam dados simulados
- Não há persistência real no banco de dados
- Ideal para desenvolvimento e testes rápidos

### CORS
- Configurado para aceitar todas as origens (`*`)
- Em produção, especificar domínios permitidos

---

## 🛠️ Testando a API

### cURL
```bash
# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@shiftbox.com","password":"user123"}'

# Pool (com token)
curl -X GET http://localhost:8000/pool \
  -H "Authorization: Bearer {seu_token}"
```

### Documentação Interativa
Acesse: http://localhost:8000/docs

