# 🖨️ PrintForge 3D — Sistema de Gestão & Catálogo de Impressão 3D

> **PrintForge 3D** é um sistema completo de gestão de custos, controle de produção e vitrine pública para estúdios e empreendedores de Impressão 3D. O software resolve a dor de precificar peças 3D de forma empírica ou imprecisa, calculando com exatidão o custo real de produção (material, consumo de energia, depreciação de maquinário, acabamento/pintura e embalagem), oferecendo uma vitrine pública interativa para atração de clientes e acompanhamento de encomendas.

---

## 🌐 Demo & Repositório

- **Repositório GitHub**: [github.com/JoaoSantosCodes/PrintForge3D](https://github.com/JoaoSantosCodes/PrintForge3D)
- **Demonstração ao Vivo**: [https://printforge3d.vercel.app](https://printforge3d.vercel.app)

---

## 📸 Screenshots

| Dashboard Administrativo | Calculadora de Peças & Custos |
| :---: | :---: |
| ![Dashboard](docs/screenshots/dashboard.png) | ![Calculadora](docs/screenshots/calculadora.png) |

| Catálogo Público de Modelos | Kanban de Gestão de Pedidos |
| :---: | :---: |
| ![Catálogo](docs/screenshots/catalogo.png) | ![Kanban](docs/screenshots/kanban.png) |

---

## ✨ Funcionalidades

### 🧮 1. Calculadora de Custos de Impressão 3D
- **Cálculo Preciso por Peça**: Computa o custo real considerando consumo de filamento (gramas), consumo elétrico (Watts/kWh da impressora), depreciação da máquina por hora de uso, insumos de pintura/acabamento (mão de obra + tintas) e embalagem.
- **Preço Sugerido & Margem**: Exibe o preço de venda recomendado com base na margem desejada pelo operador e alerta dinâmico de margem baixa (<20%).
- **Importador de G-code**: Leitura e parsing de arquivos `.gcode` para extração automática de tempo estimado e consumo em gramas.
- **Duplicação Rápida**: Duplicação de peças cadastradas para prototipagem rápida e teste de variações de custo.

### 🛍️ 2. Catálogo Público & Área do Cliente
- **Vitrine Interativa (`/catalogo`)**: Exposição pública dos modelos produzidos com busca em tempo real e filtros por categoria.
- **Solicitação de Pedido sem Fricção**: Modal rápido de solicitação de encomenda direto da peça, integrado com o perfil do cliente logado.
- **Acompanhamento de Pedidos (`/pedidos`)**: Área do usuário comum para rastrear o status da encomenda em tempo real (sem exposição de custos internos).
- **Avaliações Pós-Entrega & Prova Social**: Clientes podem avaliar peças entregues (1 a 5 estrelas e comentários), que são exibidas na página pública do modelo.

### 📋 3. Gestão de Pedidos (Kanban Administrativo)
- **Quadro Kanban (`/admin/pedidos`)**: Gerenciamento visual por colunas (*Aguardando*, *Em Impressão*, *Pintura/Acabamento*, *Pronto*, *Enviado*, *Entregue*, *Cancelados*).
- **Orçamento em PDF & WhatsApp**: Exportação de orçamentos formais em PDF com um clique e geração de link direto para WhatsApp com mensagem pré-formatada.

### 📦 4. Controle de Filamentos & Impressoras
- **Estoque de Filamento**: Controle do peso restante (gramas) por carretel com alerta automático de estoque baixo (<15%).
- **Histórico de Preços**: Rastreamento da evolução do preço de compra por marca/tipo de filamento.
- **Manutenção Preventiva**: Contador de horas acumuladas de uso da impressora 3D e alertas visuais para revisão preventiva.

### 📊 5. Relatórios & Auditoria
- **Gráficos Financeiros (Recharts)**: Gráfico diário de receita, custos e lucro acumulado dos últimos 30 dias no Dashboard.
- **Exportação de Dados**: Geração de relatórios mensais em PDF e exportação de dados em CSV com suporte UTF-8 BOM para Excel.
- **Log de Auditoria (`/admin/auditoria`)**: Rastreamento de ações administrativas sensíveis (aprovação, bloqueio e reativação de usuários).

### 🔐 6. Autenticação & Sistema Multiusuário
- **Supabase Auth**: Autenticação com e-mail/senha, fluxo de "Esqueci minha senha" e redefinição via token seguro.
- **Aprovação de Cadastros**: Novos cadastros via `/cadastro` iniciam com `status="pendente"` e exigem aprovação de um Administrador em `/admin/usuarios`.
- **Notificações por E-mail**: Disparo automático de e-mail ao cliente quando o status do pedido é alterado no Kanban (via Resend).

### 📱 7. PWA & Qualidade
- **PWA (Progressive Web App)**: Manifesto e suporte a instalação como app nativo desktop/mobile.
- **Error Boundaries**: Proteção global contra falhas de componentes com telas amigáveis de recuperação.
- **Testes Automatizados**: Suíte de testes unitários com Vitest cobrindo os cenários e casos de borda do motor de cálculo de custos.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Front-end & Framework** | [Next.js 14 (App Router)](https://nextjs.org/), [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Estilização & UI** | [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Banco de Dados & ORM** | [Prisma ORM](https://www.prisma.io/), SQLite (desenvolvimento) / PostgreSQL (produção) |
| **Autenticação & Storage** | [Supabase Auth](https://supabase.com/auth), [Supabase Storage](https://supabase.com/storage), Edge Middleware |
| **Gráficos & PDFs** | [Recharts](https://recharts.org/), [jsPDF](https://github.com/parallax/jsPDF) |
| **Testes Unitários** | [Vitest](https://vitest.dev/) |
| **Notificações & PWA** | Resend API (e-mails), Next.js Web App Manifest |

---

## 📐 Arquitetura do Sistema

```mermaid
flowchart TD
    subgraph Frontend["Front-end (Next.js 14 App Router)"]
        PublicCatalog["/catalogo (Público)"]
        UserArea["/pedidos & /perfil (Área do Cliente)"]
        AdminDashboard["/admin/** (Painel Administrativo)"]
        AuthPages["/login, /cadastro, /esqueci-senha"]
    end

    subgraph EdgeMiddleware["Edge Middleware & Auth Guard"]
        Middleware["src/middleware.ts"]
    end

    subgraph ServerBackend["Server Actions & Route Handlers"]
        CostEngine["src/lib/custos.ts"]
        EmailService["src/lib/email.ts (Resend)"]
        AuthActions["src/app/actions/auth.ts"]
        UserActions["src/app/actions/usuarios.ts"]
        OrderActions["src/app/actions/pedidos.ts"]
    end

    subgraph DatabaseStorage["Banco de Dados & Serviços Cloud"]
        PrismaORM["Prisma Client"]
        Database[("SQLite / Supabase Postgres")]
        SupabaseAuth["Supabase Auth Service"]
        SupabaseStorage["Supabase Storage (Fotos)"]
    end

    PublicCatalog font-bold
    AdminDashboard font-bold

    AuthPages -->|Autenticação| SupabaseAuth
    Middleware -->|Verifica Sessão| SupabaseAuth
    Middleware -->|Protege Rotas /admin| AdminDashboard
    Middleware -->|Protege Rotas /pedidos| UserArea

    AdminDashboard -->|Server Actions| OrderActions
    AdminDashboard -->|Server Actions| UserActions
    UserArea -->|Server Actions| OrderActions
    PublicCatalog -->|Consulta Peças & Avaliações| PrismaORM

    OrderActions -->|Dispara Notificação| EmailService
    OrderActions -->|Cálculo de Custos| CostEngine
    OrderActions -->|Persiste Pedidos| PrismaORM
    UserActions -->|Grava Logs| PrismaORM

    PrismaORM --> Database
```

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado.
- Gerenciador de pacotes `npm` ou `yarn`.

### Passo a Passo

1. **Clonar o Repositório**:
   ```bash
   git clone https://github.com/JoaoSantosCodes/PrintForge3D.git
   cd PrintForge3D
   ```

2. **Instalar as Dependências**:
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente**:
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Sincronizar o Banco de Dados (Prisma SQLite)**:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Popular os Dados Iniciais (Seed)**:
   ```bash
   # Popula impressoras, filamentos e peças de demonstração
   npm run seed

   # Popula/promove o usuário administrador inicial (configurado no .env)
   npm run seed:admin
   ```

6. **Iniciar o Servidor de Desenvolvimento**:
   ```bash
   npm run dev
   ```

7. **Acessar a Aplicação**:
   Abra o navegador em [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testes Automatizados

O projeto utiliza **Vitest** para garantir a precisão matemática das fórmulas de custos de impressão, pintura, depreciação e precificação com margem.

Para executar a suíte de testes unitários:

```bash
npm run test
```

### O que é coberto pelos testes (`src/lib/__tests__/custos.test.ts`):
- [x] Cálculo de custo proporcional de material por gramatura.
- [x] Cálculo de consumo de energia em KWh e tarifa de energia local.
- [x] Depreciação de impressora baseada no valor de compra, vida útil e tempo de impressão.
- [x] Custo de insumos de pintura e mão de obra cobrada por hora.
- [x] Custo total compilado e preço sugerido de venda com margem de lucro personalizada.
- [x] Tratamento de casos de borda (peso zero, tempo zero, margem zero).
- [x] Validação do limiar de margem baixa (`LIMIAR_MARGEM_BAIXA_PERCENTUAL`).

---

## 📄 Licença

Este projeto está licenciado sob a licença [MIT](LICENSE).
