# Documento de Requisitos — Site Locação de Equipamentos

| Campo | Valor |
|-------|-------|
| **Versão** | 1.0 |
| **Data do documento** | 2026-05-18 |
| **Fundação da empresa** | 2013 |
| **Responsável negócio** | Cezar |
| **Responsável técnico** | Flaviano Queiroz |
| **Status** | ☑ Aprovado |

---

## 1. Empresa (resumo)

| Item | Resposta |
|------|----------|
| **Razão social / nome fantasia** | Acesso Equipamentos LTDA |
| **CNPJ** (opcional no site) | 17.556.962/0001-24 |
| **Anos de mercado** | Empresa fundada em **2013**; sócios com experiência no setor **anterior** à fundação |
| **Proposta em uma frase** | Locação de equipamentos para construção civil e obras na região metropolitana de Belo Horizonte e região, com entrega rápida e frota revisada. |

**Texto oficial para o site (aprovado):**

- Use **“Desde 2013”** ou **“Mais de uma década”** para a **empresa** (Acesso Equipamentos LTDA).
- Use **“Mais de 20 anos de experiência no mercado de locação”** para a **trajetória dos sócios/equipe** — não como data de fundação da LTDA.
- Exemplo de frase combinada: *“Fundada em 2013, com uma equipe que soma mais de 20 anos de experiência em locação de equipamentos.”*

---

## 2. Serviços oferecidos

| Categoria | Loca? | Observações |
|-----------|:-----:|-------------|
| Equipamentos aéreos (plataforma, tesoura, articulado) | ☑ Sim | |
| Concretagem (betoneira, vibrador, mangote) | ☑ Sim | |
| Compactação (placa vibratória, sapata, rolo) | ☑ Sim | |
| Demolição / perfuração (martelete, rompedor) | ☑ Sim | |
| Andaimes / acesso / linha de vida | ☑ Sim | |
| Energia (gerador, torre de iluminação) | ☑ Sim | |
| Ferramentas elétricas diversas | ☑ Sim | |
| **Outros** | ☐ Não | — |

**Serviços além da locação:**

- ☑ Entrega e retirada na obra
- ☑ Retirada na loja/base (opcional, se o cliente preferir)
- ☐ Operador / manutenção inclusa
- ☑ Locação por diária / semanal / mensal
- ☑ Contrato B2B (construtoras, longo prazo)

---

## 3. Regiões atendidas

| Item | Resposta |
|------|----------|
| **Cidade / sede principal** | Belo Horizonte |
| **Estado(s)** | Minas Gerais |
| **Raio de atendimento** | Região metropolitana de BH + algumas cidades do interior de MG |
| **Cidades ou bairros prioritários para SEO** | Região metropolitana de BH e entorno |
| **Faz entrega?** | ☑ Sim — depende do equipamento (ex.: equipamentos maiores como guindaste/franna) |
| **Endereço físico no site** | Praça Chuí, 100 — João Pinheiro, Belo Horizonte — MG, CEP 30530-120 |

---

## 4. Diferenciais competitivos

| # | Diferencial | Prova / evidência no site |
|---|-------------|---------------------------|
| 1 | Empresa desde 2013 + equipe com 20+ anos no setor | Seção “Sobre nós” + rodapé (ver texto oficial acima) |
| 2 | Portfólio amplo e especializado em trabalho em altura | Páginas dedicadas: plataformas (tesoura, lança articulada, elevador individual), andaimes multidirecionais, guindaste/munck, Manitou MXT 840 |
| 3 | Equipamentos em conformidade com NR-12 | Case/post: segurança e qualidade para a obra |
| 4 | Atendimento a clientes de grande porte | Cases: mineradora, siderúrgica, shopping, galpões logísticos, centro comercial em BH |
| 5 | Entrega/retirada na obra + política de qualidade | Texto de entrega/coleta + página Missão, Visão e Política da Qualidade |

**Certificações / compliance:**

- ☑ NR-35 (trabalho em altura)
- ☑ NR-18 (equipamentos revisados)
- ☑ Seguro de equipamentos
- ☐ ART / documentação para órgãos (não priorizado no MVP)

---

## 5. Público-alvo e jornada

| Item | Resposta |
|------|----------|
| **Cliente principal** | Construtoras, empreiteiras, autônomos, prefeituras |
| **Ticket médio** | Médio |
| **Como o cliente chega hoje?** | Google (principal) |
| **Ação principal no site** | **WhatsApp** (prioridade); formulário de orçamento como apoio |

---

## 6. Conteúdo e tom de comunicação

| Item | Resposta |
|------|----------|
| **Tom de voz** | Formal |
| **Idioma do site** | Apenas pt-BR |
| **Exibir preços no site?** | **Só sob consulta** (sem “a partir de R$”) |
| **Concorrentes** (uso interno) | Ver [CONCORRENTES-REFERENCIAS.md](./CONCORRENTES-REFERENCIAS.md) — Santos, LOMAQ, Lokaforte, Loca Exata, Central Loc |

---

## 7. Contatos oficiais (para o site)

| Canal | Valor |
|-------|-------|
| **Telefone comercial** | (31) 3376-3377 |
| **WhatsApp** | +55 31 99470-0201 |
| **E-mail comercial** | comercial@acessoequipamentos.com.br |
| **Instagram** | @acessoequipamentos |
| **Horário de atendimento** | Seg–sex, 7h30 às 17h15 |

---

## 8. Escopo do MVP (acordo)

**Incluído na primeira versão:**

- Site institucional + catálogo de equipamentos
- Formulário de orçamento com salvamento de leads
- Botão WhatsApp com mensagem pré-preenchida (CTA principal)
- Páginas: Home, Equipamentos, Categorias, Sobre, Contato, Orçamento, FAQ
- SEO: títulos, meta descriptions, sitemap, Search Console
- SEO avançado (quando viável no MVP): JSON-LD (`LocalBusiness`), páginas por categoria com texto único, Open Graph, URLs amigáveis, breadcrumbs

**Fora do MVP (fase posterior):**

- Login / área do cliente
- Reserva online com calendário
- Pagamento pelo site
- Integração ERP em tempo real

**Aprovado por:**

| Nome | Papel | Data |
|------|-------|------|
| Cezar | Negócio | 2026-05-18 |
| Flaviano Queiroz | Técnico | 2026-05-18 |

---

## Resumo técnico (referência rápida dev)

```yaml
brand: Acesso Equipamentos
founded: 2013
team_experience: "20+ anos no setor de locação"
slug: acesso-equipamentos
locale: pt-BR
tone: formal
pricing: sob_consulta
primary_cta: whatsapp
phone: "3133763377"
whatsapp: "5531994700201"
email: comercial@acessoequipamentos.com.br
instagram: acessoequipamentos
address:
  street: "Praça Chuí, 100"
  neighborhood: João Pinheiro
  city: Belo Horizonte
  state: MG
  zip: "30530-120"
seo_region: "região metropolitana de Belo Horizonte"
categories:
  - equipamentos-aereos
  - concretagem
  - compactacao
  - demolicao-perfuracao
  - andaimes-acesso
  - energia
  - ferramentas-eletricas
```

---

_Documento aprovado — referência para Sprints 1–8._

**Identidade visual:** ver [BRAND-GUIDE.md](./BRAND-GUIDE.md) (tarefa 0.3).
