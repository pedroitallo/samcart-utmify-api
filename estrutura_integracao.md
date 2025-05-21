# Estrutura de Integração SamCart-UTMify

## Visão Geral da Arquitetura

A integração entre SamCart e UTMify será implementada como uma aplicação serverless hospedada na Vercel. Esta aplicação funcionará como um intermediário (middleware) que receberá os webhooks da SamCart, transformará os dados para o formato esperado pela UTMify e os enviará para a API da UTMify.

## Componentes Principais

### 1. API Serverless (Next.js API Routes)

Utilizaremos o framework Next.js para criar uma API serverless que será implantada na Vercel. Esta abordagem oferece:
- Escalabilidade automática
- Baixa latência
- Sem necessidade de gerenciar servidores
- Implantação simplificada

### 2. Endpoint de Webhook

Criaremos um endpoint específico para receber os webhooks da SamCart:
```
POST /api/webhook/samcart
```

Este endpoint será responsável por:
- Validar a autenticidade do webhook (usando um segredo compartilhado)
- Receber os dados de vendas da SamCart
- Acionar o processamento dos dados

### 3. Serviço de Transformação de Dados

Um módulo dedicado para mapear os dados do formato SamCart para o formato UTMify:
- Extração de informações do cliente
- Mapeamento de produtos
- Conversão de valores monetários para centavos
- Extração de parâmetros UTM da URL do checkout (se disponíveis)
- Formatação de datas para o padrão UTC

### 4. Serviço de Comunicação com a UTMify

Módulo responsável por:
- Autenticar com a API da UTMify usando o token fornecido
- Enviar os dados transformados para o endpoint correto
- Processar respostas e erros da API
- Implementar mecanismos de retry em caso de falhas temporárias

### 5. Sistema de Logging e Monitoramento

Para garantir a confiabilidade da integração:
- Logs detalhados de cada etapa do processo
- Registro de erros e exceções
- Monitoramento de performance
- Alertas para falhas críticas

## Fluxo de Dados

1. **Recebimento do Webhook**:
   - SamCart envia dados de venda para o endpoint de webhook
   - A aplicação valida a autenticidade do webhook
   - Os dados brutos são armazenados temporariamente

2. **Processamento e Transformação**:
   - Os dados são extraídos do formato SamCart
   - As informações são mapeadas para o formato UTMify
   - Os parâmetros UTM são extraídos da URL do checkout
   - Datas são convertidas para o formato UTC
   - Valores monetários são convertidos para centavos

3. **Envio para UTMify**:
   - O token de API da UTMify é obtido da configuração
   - Os dados transformados são enviados para a API da UTMify
   - A resposta da API é processada
   - Em caso de erro, são implementadas tentativas de reenvio

4. **Registro e Resposta**:
   - O resultado da operação é registrado
   - Uma resposta apropriada é enviada de volta para a SamCart

## Configuração e Variáveis de Ambiente

A aplicação utilizará as seguintes variáveis de ambiente:
- `UTMIFY_API_TOKEN`: Token de autenticação da API UTMify
- `SAMCART_WEBHOOK_SECRET`: Segredo compartilhado para validar webhooks da SamCart
- `LOG_LEVEL`: Nível de detalhamento dos logs
- `RETRY_ATTEMPTS`: Número de tentativas em caso de falha na comunicação com a UTMify

## Tratamento de Erros

A aplicação implementará estratégias robustas de tratamento de erros:
- Validação de entrada para garantir que os dados recebidos estão completos
- Tratamento de exceções durante a transformação dos dados
- Mecanismo de retry com backoff exponencial para falhas de comunicação
- Registro detalhado de erros para facilitar a depuração

## Segurança

Para garantir a segurança da integração:
- Validação de autenticidade dos webhooks usando HMAC
- Armazenamento seguro de tokens e segredos usando variáveis de ambiente
- Comunicação via HTTPS para todas as requisições
- Validação e sanitização de todos os dados de entrada

## Estrutura de Diretórios do Projeto

```
/
├── pages/
│   └── api/
│       └── webhook/
│           └── samcart.js       # Endpoint para receber webhooks da SamCart
├── lib/
│   ├── samcart/
│   │   └── parser.js            # Processamento dos dados da SamCart
│   ├── utmify/
│   │   ├── client.js            # Cliente para comunicação com a API da UTMify
│   │   └── mapper.js            # Mapeamento de dados para o formato UTMify
│   ├── utils/
│   │   ├── logger.js            # Utilitário de logging
│   │   ├── validator.js         # Validação de dados
│   │   └── hmac.js              # Validação de autenticidade do webhook
│   └── config.js                # Configurações da aplicação
├── middleware/
│   └── auth.js                  # Middleware de autenticação
├── tests/                       # Testes automatizados
├── .env.example                 # Exemplo de variáveis de ambiente
├── package.json
└── README.md                    # Documentação do projeto
```

## Próximos Passos

1. Configurar o ambiente de desenvolvimento
2. Implementar o endpoint de webhook
3. Desenvolver o serviço de transformação de dados
4. Implementar o cliente da API UTMify
5. Adicionar logging e tratamento de erros
6. Escrever testes automatizados
7. Implantar na Vercel
8. Configurar o webhook na SamCart
9. Validar o funcionamento da integração
