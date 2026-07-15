# API interna — qualidade comercial de novas campanhas

API privada somente leitura para um app externo consultar qualidade comercial das campanhas novas sem acessar o banco do site diretamente.

## Autenticação

Configure no site:

```env
INTERNAL_API_SECRET=um-segredo-forte-com-pelo-menos-24-caracteres
```

O app externo deve enviar:

```http
Authorization: Bearer SEU_TOKEN
```

Sem `INTERNAL_API_SECRET`, os endpoints retornam `503 internal_api_not_configured`. Token ausente ou inválido retorna `401 unauthorized`.

## Escopo de segurança

- Endpoints são server-to-server, não para navegador.
- `campaignPrefix` é obrigatório para evitar consulta acidental de campanhas antigas.
- Os leads retornam dados redigidos: sem telefone, e-mail, nome, empresa, mensagem ou notas internas.
- A API é somente leitura.

## Filtros

Todos os endpoints aceitam:

| Parâmetro | Obrigatório | Exemplo | Observação |
|-----------|-------------|---------|------------|
| `campaignPrefix` | Sim | `nova_` | Apenas letras, números, `_` e `-` |
| `dateFrom` ou `from` | Não | `2026-07-01` | Padrão: primeiro dia do mês atual, fuso Brasília |
| `dateTo` ou `to` | Não | `2026-07-31` | Padrão: hoje, fuso Brasília |
| `source` | Não | `google` | Filtro exato normalizado |
| `medium` | Não | `cpc` | Filtro exato normalizado |
| `page` | Só leads | `2` | Padrão `1` |
| `pageSize` | Só leads | `50` | Padrão `50`, máximo `100` |

## Endpoints

### Resumo

```http
GET /api/internal/v1/ads-quality/summary?campaignPrefix=nova_&from=2026-07-01&to=2026-07-31&source=google&medium=cpc
```

Retorna totais agregados:

```json
{
  "period": {
    "dateFrom": "2026-07-01",
    "dateTo": "2026-07-31",
    "timezone": "America/Sao_Paulo"
  },
  "filters": {
    "campaignPrefix": "nova_",
    "source": "google",
    "medium": "cpc"
  },
  "totals": {
    "campaigns": 3,
    "leads": 42,
    "whatsappClicks": 58,
    "whatsappOpened": 38,
    "whatsappReplied": 21,
    "won": 4,
    "withGclid": 39,
    "openRate": 0.9048,
    "replyRate": 0.5,
    "wonRate": 0.0952,
    "gclidRate": 0.9286
  }
}
```

### Campanhas

```http
GET /api/internal/v1/ads-quality/campaigns?campaignPrefix=nova_&from=2026-07-01&to=2026-07-31
```

Retorna os mesmos totais do resumo e a lista por campanha:

```json
{
  "campaigns": [
    {
      "campaign": "nova_plataformas_rmbh_2026_07",
      "utmSource": "google",
      "utmMedium": "cpc",
      "leads": 20,
      "whatsappClicks": 27,
      "whatsappOpened": 18,
      "whatsappReplied": 11,
      "won": 2,
      "withGclid": 19,
      "openRate": 0.9,
      "replyRate": 0.55,
      "wonRate": 0.1,
      "gclidRate": 0.95
    }
  ]
}
```

### Leads redigidos

```http
GET /api/internal/v1/ads-quality/leads?campaignPrefix=nova_&from=2026-07-01&to=2026-07-31&page=1&pageSize=50
```

Retorna leads sem PII:

```json
{
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 42,
    "totalPages": 1
  },
  "leads": [
    {
      "leadId": 123,
      "createdAt": "2026-07-15T13:12:00.000Z",
      "utmCampaign": "nova_plataformas_rmbh_2026_07",
      "utmSource": "google",
      "utmMedium": "cpc",
      "utmContent": "rsa_01",
      "utmTerm": "aluguel plataforma elevatoria bh",
      "gclidPresent": true,
      "city": "Contagem",
      "geoCity": "Contagem",
      "geoRegion": "MG",
      "equipmentSlug": "plataforma-elevatoria-gs-1930s",
      "equipmentName": "PLATAFORMA ELEVATORIA GS-1930S",
      "landingPage": "/categorias/plataformas-elevatorias",
      "leadKind": "quote",
      "status": "contacted",
      "whatsappOpened": true,
      "whatsappRepliedAt": "2026-07-15T13:18:00.000Z",
      "won": false
    }
  ]
}
```

## Exemplo com curl

```shell
curl "https://acessoequipamentos.com.br/api/internal/v1/ads-quality/campaigns?campaignPrefix=nova_&from=2026-07-01&to=2026-07-31&source=google&medium=cpc" \
  -H "Authorization: Bearer $INTERNAL_API_SECRET"
```

## Interpretação

- `whatsappClicks`: cliques rastreados nos botões do site.
- `whatsappOpened`: orçamento enviado e navegador conseguiu abrir o WhatsApp.
- `whatsappReplied`: ChatPro registrou mensagem recebida do cliente.
- `replyRate`: `whatsappReplied / leads`.
- `wonRate`: `won / leads`, dependente de marcação comercial no painel.
