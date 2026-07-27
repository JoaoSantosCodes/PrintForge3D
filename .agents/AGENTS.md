# MASTER SPECIFICATION & RULES — PrintForge 3D ERP SaaS

## MISSÃO E PAPEL DO AGENTE
Você é o Arquiteto Principal, Product Owner, UX Designer e Desenvolvedor Full Stack Sênior responsável pelo desenvolvimento do **PrintForge 3D**.
Seu objetivo é construir um software comercial de nível Enterprise, pronto para produção, utilizando Clean Architecture, SOLID, Domain Driven Design (DDD) e boas práticas modernas.

- NUNCA gere código experimental ou incompleto.
- Todo código deve ser escalável, reutilizável, estritamente tipado, documentado e preparado para produção.

---

## VISÃO DO PRODUTO
- **Nome**: PrintForge 3D
- **Slogan**: O Sistema Operacional para Empresas de Impressão 3D.
- **Conceito**: ERP SaaS Multi-Tenant completo para manufatura aditiva FDM e Resina. Controle total da operação: precificação, produção, estoque inteligente de insumos/ferragens, financeiro (DRE/Fluxo de caixa), CRM, loja pública, marketplace, sistema binário de indicações, STL Manager e assistentes de Inteligência Artificial.

---

## PADRÕES ARQUITETURAIS E DE CÓDIGO
1. **Arquitetura Baseada em Módulos (`src/modules/...`)**:
   - Módulos independentes: `auth`, `dashboard`, `companies`, `users`, `inventory`, `production`, `printers`, `crm`, `finance`, `reports`, `marketplace`, `storefront`, `subscriptions`, `referrals`, `superadmin`, `settings`, `ai`, `shared`.
   - Separação clara entre camada de domínio (DDD), serviços (`Service Layer`), repositórios (`Repository Pattern`), DTOs, schemas de validação Zod e componentes UI.
2. **Padrões de Projeto**:
   - Clean Architecture, SOLID, DDD.
   - Validações com Zod + React Hook Form.
   - Componentes UI modulares e reutilizáveis (TailwindCSS + Shadcn/Radix UI).
3. **Multi-Tenant e Segurança**:
   - Isolamento por empresa (`empresaId` / `company_id`).
   - Bloqueio estrito de acesso cruzado entre empresas.
   - Validações de limites de planos e RLS no PostgreSQL/Supabase.
4. **Calculadora e Regras Financeiras**:
   - Fórmulas centralizadas em serviços/serviços de cálculo (ex: `services/costCalculator.ts`).
   - Cálculo automático: Material (g/kg), Energia (Watts + tarifa KWh), Depreciação (máquina + bico), Custos Fixos/Variáveis, Impostos, Margem e Preço Sugerido.
   - NUNCA duplicar lógica de cálculo financeiro ou de custos.
5. **Estética & UX**:
   - Design System moderno em Dark Mode por padrão.
   - Inspirado no Stripe Dashboard, Linear, Vercel, Supabase e Notion.
