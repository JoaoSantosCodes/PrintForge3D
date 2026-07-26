# 🚀 Checklist de Deploy & Produção — PrintForge 3D

Este documento contém o guia completo de pré-produção, migração de banco de dados, inicialização de administrador e deploy no **Vercel + Supabase**.

---

## 🔑 1. Autenticação Real & Criação do Administrador Inicial

O sistema utiliza o **Supabase Auth** integrado aos perfis do Prisma (`Profile`).

### Passo 1.1 — Configurar Variáveis de Ambiente do Administrador
Antes de rodar o deploy, defina no seu arquivo `.env` ou no painel da Vercel:
```env
ADMIN_EMAIL="admin@printforge3d.com"
ADMIN_PASSWORD="SuaSenhaSegura123!"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1Ni..."
```

### Passo 1.2 — Executar o Seed de Administrador
Para promover ou criar o primeiro administrador aprovado no sistema:

```bash
# Executa o seed de administrador inicial
npm run seed:admin
```
*Este comando criará o usuário no Supabase Auth e atribuirá `role="admin"` e `status="aprovado"` no banco Prisma.*

### Passo 1.3 — Configuração de Confirmação de E-mail no Dashboard Supabase
No painel web do Supabase ([supabase.com/dashboard](https://supabase.com/dashboard)):
1. Acesse **Authentication > Providers > Email**.
2. Marque a opção **"Confirm email"** para exigir confirmação de e-mail antes de autenticar o usuário.
3. Acesse **Authentication > URL Configuration**:
   - `Site URL`: `https://seu-dominio.vercel.app`
   - `Redirect URLs`: Adicione `https://seu-dominio.vercel.app/redefinir-senha` e `http://localhost:3000/redefinir-senha`.

---

## 🗄️ 2. Migração do Banco de Dados (SQLite ➡️ Supabase PostgreSQL)

Por padrão no desenvolvimento local Windows, o projeto utiliza `file:./dev.db` (SQLite). Para produção, siga os passos abaixo para migrar para o PostgreSQL do Supabase:

### Passo 2.1 — Atualizar o `prisma/schema.prisma`
No arquivo `prisma/schema.prisma`, substitua a seção `datasource db`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Passo 2.2 — Executar a Migração
No terminal:

```bash
# 1. Gerar os arquivos de migração PostgreSQL
npx prisma migrate dev --name init_postgres

# 2. Aplicar o schema no banco de produção
npx prisma db push

# 3. Popular dados iniciais de impressoras/filamentos e administrador
npm run db:reset
```

---

## 🌐 3. Configuração de Variáveis de Ambiente na Vercel

No painel do projeto na **Vercel** (`Settings > Environment Variables`), cadastre as variáveis:

| Variável | Descrição / Valor |
| :--- | :--- |
| `DATABASE_URL` | String de conexão do Supabase com Transaction Pooling (`:6543`) |
| `DIRECT_URL` | String de conexão direta do Supabase (`:5432`) para migrações |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública da sua instância no Supabase (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta `service_role` (uso server-side apenas) |
| `ADMIN_EMAIL` | E-mail do primeiro administrador do sistema |
| `ADMIN_PASSWORD` | Senha inicial do primeiro administrador |

---

## 🪣 4. Configuração do Supabase Storage (Fotos de Peças)

- [ ] Acesse o dashboard do Supabase em **Storage > Buckets**.
- [ ] Crie um bucket público chamado **`pecas-fotos`**.
- [ ] Configure as políticas de RLS para permitir upload e visualização de imagens.

---

## ⚡ 5. Passos para Deploy na Vercel

### Opção A: Deploy via GitHub (Recomendado)
1. Faça push do código para o repositório GitHub.
2. Importe o repositório no dashboard da Vercel ([vercel.com/new](https://vercel.com/new)).
3. Insira as variáveis de ambiente descritas na **Seção 3**.
4. Clique em **Deploy**.

### Opção B: Deploy via Vercel CLI
```bash
# 1. Fazer login na Vercel CLI
npx vercel login

# 2. Executar o deploy de produção
npx vercel --prod
```

---

## 🛡️ 6. Recursos de Proteção Ativos no Sistema

- **Sistema de Aprovação de Cadastros**: Todo novo cadastro de usuário via `/cadastro` inicia como `status="pendente"` e requer aprovação de um Administrador em `/admin/usuarios`.
- **Middleware Protegido**: Bloqueio de rotas `/admin/**` para contas não administradoras ou pendentes/bloqueadas.
- **Rate Limiting no Login**: Bloqueio de 1 minuto após 5 tentativas de login com erro.
