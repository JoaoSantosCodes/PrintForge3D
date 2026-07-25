# 🚀 Checklist de Deploy & Pré-Produção — PrintForge 3D

Este documento contém o guia completo de pré-produção, migração de banco de dados e passos de deploy para colocar o **PrintForge 3D** em produção (Vercel + Supabase).

---

## 🔒 1. Trava de Segurança: Desativar Modo Demo

Em ambiente local de desenvolvimento, o sistema permite utilizar as credenciais demo (`admin@printforge3d.com` / `admin123`).

- [ ] **No painel da Vercel / Servidor de Produção**, certifique-se de configurar:
  ```env
  DEMO_MODE=false
  ```
- [ ] **Verificação**: Tentar logar com `admin@printforge3d.com` em produção deve retornar a mensagem: *"O Modo Demo de autenticação está desativado neste ambiente."*

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
No terminal da sua máquina local:

```bash
# 1. Gerar os arquivos de migração PostgreSQL
npx prisma migrate dev --name init_postgres

# 2. Aplicar o schema no banco de produção
npx prisma db push

# 3. (Opcional) Popular o banco de produção com os dados iniciais
npm run seed
```

---

## 🌐 3. Configuração de Variáveis de Ambiente na Vercel

No painel do projeto na **Vercel** (`Settings > Environment Variables`), cadastre as seguintes variáveis:

| Variável | Descrição / Valor |
| :--- | :--- |
| `DATABASE_URL` | String de conexão do Supabase com Transaction Pooling (`:6543`) |
| `DIRECT_URL` | String de conexão direta do Supabase (`:5432`) para migrações |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública da sua instância no Supabase (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta `service_role` (uso server-side apenas) |
| `DEMO_MODE` | `false` (Desativa logins demo obrigatoriamente) |

---

## 🪣 4. Configuração do Supabase Storage (Fotos de Peças)

- [ ] Acesse o dashboard do Supabase em **Storage > Buckets**.
- [ ] Crie um bucket público chamado **`pecas-fotos`**.
- [ ] Configure as políticas de RLS (Read/Write) para permitir upload de imagens de peças.

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

- **Rate Limiting no Login**: Bloqueio temporário após 5 tentativas de login com erro em menos de 1 minuto por conta/IP.
- **Validação de Formulários Zod**: Proteção contra valores negativos/nulos em peso, tempo, preços e vida útil.
- **Sigilo Comercial no PDF**: Nenhum custo interno de filamento, energia ou mão de obra é exposto no orçamento comercial gerado para o cliente.
