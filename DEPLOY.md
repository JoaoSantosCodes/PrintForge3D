# 🚀 Checklist de Deploy & Produção — PrintForge 3D (SaaS Multiempresa)

Este documento contém o guia completo de pré-produção, migração de banco de dados multi-tenant, inicialização de administrador/super-admin, fluxo de cobrança manual e deploy no **Vercel + Supabase**.

---

## 🏢 1. Modelo SaaS Multiempresa (Multi-tenant) & Scripts de Seed

O sistema suporta múltiplas lojas de impressão 3D com isolamento por empresa.

### Criar o Perfil Super-Admin
Defina no arquivo `.env` ou no painel da Vercel:
```env
SUPERADMIN_EMAIL="superadmin@printforge3d.com"
```

Execute o seed do Super-Admin:
```bash
npm run seed:superadmin
```

### Migrar Dados Legados (se aplicável)
Para vincular todos os registros operacionais existentes a uma Empresa inicial ("Minha Loja") e Plano "Legado":
```bash
npm run seed:multi-tenant
```

---

## 💰 2. Fluxo de Cobrança Manual de Assinaturas (SaaS)

Nesta fase do projeto, a cobrança das empresas vendedoras é realizada de forma manual:

1. **Acompanhamento**: O Super-Admin acessa `/superadmin/empresas` para visualizar a lista de lojas, plano contratado, status (`trial`, `ativo`, `inadimplente`, `trial_expirado`, `bloqueado`) e data da próxima cobrança.
2. **Confirmação de Pagamento**: Quando o vendedor efetuar a transferência/PIX da mensalidade do seu plano:
   - Acesse o painel em `/superadmin/empresas`.
   - Clique no botão **"Marcar mensalidade como paga"** ao lado da empresa correspondente.
   - O sistema atualizará automaticamente o status para `ativo` e a data de `proximaCobranca` para **+30 dias**.
3. **Automação de Vencimentos (Cron Job Protegido)**:
   - A rota `/api/cron/check-subscriptions` exige autenticação via `CRON_SECRET`.
   - Defina a variável de ambiente `CRON_SECRET` na Vercel (ou em `.env.local`).
   - Requisições para a rota devem incluir o header `Authorization: Bearer <CRON_SECRET>` ou `x-cron-secret`. O Vercel Cron envia o header `Authorization: Bearer <CRON_SECRET>` automaticamente quando a variável `CRON_SECRET` está cadastrada.
   - A rota converterá automaticamente:
     - Trials vencidos (`trialExpiraEm < agora`) para status `trial_expirado`.
     - Assinaturas vencidas (`proximaCobranca < agora`) para status `inadimplente`.

---

## 🔑 3. Autenticação & Configuração Supabase Auth

### Configuração de Confirmação de E-mail
No painel web do Supabase ([supabase.com/dashboard](https://supabase.com/dashboard)):
1. Acesse **Authentication > Providers > Email**.
2. Marque a opção **"Confirm email"** para exigir confirmação de e-mail antes de autenticar o usuário.
3. Acesse **Authentication > URL Configuration**:
   - `Site URL`: `https://seu-dominio.vercel.app`
   - `Redirect URLs`: Adicione `https://seu-dominio.vercel.app/redefinir-senha` e `http://localhost:3000/redefinir-senha`.

---

## 🌐 4. Configuração de Variáveis de Ambiente na Vercel

No painel do projeto na **Vercel** (`Settings > Environment Variables`), cadastre as variáveis:

| Variável | Descrição / Valor |
| :--- | :--- |
| `DATABASE_URL` | String de conexão do Supabase com Transaction Pooling (`:6543`) |
| `DIRECT_URL` | String de conexão direta do Supabase (`:5432`) para migrações |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública da sua instância no Supabase (`https://xyz.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública `anon` do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave secreta `service_role` (uso server-side apenas) |
| `SUPERADMIN_EMAIL` | E-mail do Super-Admin da plataforma SaaS |

---

## 🪣 5. Configuração do Supabase Storage (Fotos de Peças)

- [ ] Acesse o dashboard do Supabase em **Storage > Buckets**.
- [ ] Crie um bucket público chamado **`pecas-fotos`**.
- [ ] Configure as políticas de RLS para permitir upload e visualização de imagens.

---

## ⚡ 6. Passos para Deploy na Vercel

### Deploy via GitHub (Recomendado)
1. Faça push do código para o repositório GitHub.
2. Importe o repositório no dashboard da Vercel ([vercel.com/new](https://vercel.com/new)).
3. Insira as variáveis de ambiente descritas na **Seção 4**.
4. Clique em **Deploy**.

---

## 🛡️ 7. Recursos de Proteção & Isolamento Multi-tenant

- **Isolamento Rígido por Empresa**: Todas as consultas e Server Actions filtram estritamente por `empresaId`.
- **Painel Super-Admin Exclusivo**: Rotas `/superadmin/**` restritas ao papel `super_admin`.
- **Controle de Limites por Plano**: Verificação dos limites de impressoras, peças e pedidos mensais antes da criação de novos registros.
