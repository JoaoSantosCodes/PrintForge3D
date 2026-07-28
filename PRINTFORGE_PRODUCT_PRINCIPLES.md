# PRINTFORGE — PRINCIPIOS PERMANENTES DE PRODUTO E ENGENHARIA

> **Guia de Referência Permanente para a Evolução da Plataforma PrintForge**  
> *Versão de Referência: PrintForge X 1.0 LTS*

---

## 🎯 Os 6 Princípios Inegociáveis

### 1. Redução Contínua do Trabalho Manual
Cada atualização da plataforma deve ativamente eliminar passos manuais, automações repetitivas ou digitação desnecessária. Se um processo puder ser inferido, pré-preenchido ou automatizado com segurança pela IA, essa deve ser a abordagem padrão.

### 2. Transparência & Explicabilidade da Inteligência Artificial
A Inteligência Artificial deve ser um assistente confiável. Recomendações e estimativas devem indicar claramente quando são simulações, explicando a justificativa lógica e os fatores de cálculo utilizados (*ex: variação do slicer, parâmetros da máquina, histórico do lote*).

### 3. Simplicidade & Clareza de UX
Nenhuma nova funcionalidade deve aumentar a complexidade da interface sem entregar um ganho proporcional de valor para o usuário. Telas administrativas, operacionais e de chão de fábrica devem manter foco absoluto no objetivo da persona correspondente.

### 4. Avaliação por Quatro Critérios Chave
Qualquer nova proposta de funcionalidade deve demonstrar impacto positivo em pelo menos um destes pilares:
- 📉 **Reduzir Custo Operacional**
- ⚡ **Aumentar Produtividade**
- ⭐ **Melhorar a Qualidade / Experiência do Usuário (UX)**
- 💰 **Abrir Nova Oportunidade de Receita**

### 5. Estabilidade do Core LTS & Expansão Desacoplada
O núcleo da plataforma (*Multi-Tenant, Auth, RBAC/ABAC, Event Bus, Outbox, Logger*) deve permanecer estável e com suporte de longo prazo (LTS). Novas inovações devem nascer preferencialmente de forma desacoplada via módulos independentes, Plugin SDK ou Feature Flags.

### 6. Priorização Orientada a Evidências & Telemetria Real
A evolução do produto deve ser guiada por dados empíricos de uso reais (*Product Intelligence, Customer Health Score, NPS, Taxa de Retenção*), em vez de suposições ou opiniões isoladas.

---

## 🛠️ Critérios de Aceitação de Engenharia & Qualidade

- **Cobertura de Testes Automatizados**: Suíte contínua com 100% de aprovação em testes unitários e de integração.
- **Tipagem Estrita**: Zero erros no compilador TypeScript (`npx tsc --noEmit`).
- **Resiliência de Serviço**: Zero exceções não tratadas em Server Components (*utilizar sempre o wrapper `ServiceResult<T>` e fallback gracioso*).
- **Rastreabilidade**: Todo log estruturado deve carregar `correlationId` para depuração de auditoria.
