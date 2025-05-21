# Resumo da API UTMify

## Endpoint Principal
- **URL**: `https://api.utmify.com.br/api-credentials/orders`
- **Método**: POST

## Autenticação
- **Header**: `x-api-token`
- **Formato**: `{ 'x-api-token': 'string' }`
- **Obtenção**: Acessar conta UTMify > Integrações > Webhooks > Credenciais de API > Adicionar Credencial > Criar Credencial

## Estrutura do Payload

### Body Principal
```json
{
  "orderId": "string",
  "platform": "string",
  "paymentMethod": "credit_card | boleto | pix | paypal | free_price",
  "status": "waiting_payment | paid | refused | refunded | chargedback",
  "createdAt": "YYYY-MM-DD HH:MM:SS", // UTC
  "approvedDate": "YYYY-MM-DD HH:MM:SS | null", // UTC
  "refundedAt": "YYYY-MM-DD HH:MM:SS | null", // UTC
  "customer": {
    "name": "string",
    "email": "string",
    "phone": "string | null",
    "document": "string | null",
    "country": "string", // ISO 3166-1 alfa-2
    "ip": "string"
  },
  "products": [
    {
      "id": "string",
      "name": "string",
      "planId": "string | null",
      "planName": "string | null",
      "quantity": number,
      "priceInCents": number
    }
  ],
  "trackingParameters": {
    "src": "string | null",
    "sck": "string | null",
    "utm_source": "string | null",
    "utm_campaign": "string | null",
    "utm_medium": "string | null",
    "utm_content": "string | null",
    "utm_term": "string | null"
  },
  "commission": {
    "totalPriceInCents": number,
    "gatewayFeeInCents": number,
    "userCommissionInCents": number,
    "currency": "BRL | USD | EUR | GBP | ARS | CAD"
  },
  "isTest": boolean // opcional
}
```

## Observações Importantes
1. Os parâmetros de rastreamento (UTM) devem ser extraídos da URL do checkout no momento da compra
2. Serão aceitos somente pedidos de até 7 dias anteriores e no máximo 45 dias para reembolsos ou chargebacks
3. A API valida todos os dados enviados e retorna campos inválidos na resposta
4. O campo `isTest` quando `true` valida as informações mas não salva a transação

## Fluxo de Integração Necessário
1. Receber webhook da SamCart com dados da venda
2. Mapear os dados do formato SamCart para o formato UTMify
3. Extrair parâmetros UTM da URL do checkout (se disponíveis)
4. Enviar dados para a API UTMify com o token de autenticação
5. Tratar respostas e possíveis erros
