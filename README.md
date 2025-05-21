# Integração SamCart-UTMify

Este projeto implementa uma integração entre a plataforma SamCart e a UTMify, permitindo o envio automático de dados de vendas da SamCart para a UTMify através de webhooks e API.

## Visão Geral

A integração funciona como um middleware que:
1. Recebe webhooks da SamCart quando ocorrem vendas
2. Processa e transforma os dados para o formato esperado pela UTMify
3. Envia os dados para a API da UTMify
4. Registra logs e gerencia erros durante todo o processo

## Tecnologias Utilizadas

- **Next.js**: Framework React para criação de API serverless
- **Node.js**: Ambiente de execução JavaScript
- **Axios**: Cliente HTTP para comunicação com a API da UTMify
- **Winston**: Sistema de logging
- **Vercel**: Plataforma de hospedagem para implantação

## Estrutura do Projeto

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
└── README.md                    # Documentação do projeto
```

## Configuração

### Pré-requisitos

- Node.js 14.x ou superior
- Conta na UTMify com token de API
- Conta na SamCart com acesso à configuração de webhooks

### Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure as seguintes variáveis:

```
# Configurações da UTMify
UTMIFY_API_TOKEN=seu_token_da_utmify
RETRY_ATTEMPTS=3
RETRY_DELAY=1000

# Configurações da SamCart
SAMCART_WEBHOOK_SECRET=seu_segredo_do_webhook

# Configurações de logging
LOG_LEVEL=info
```

## Instalação e Execução Local

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/samcart-utmify-integration.git
   cd samcart-utmify-integration
   ```

2. Instale as dependências:
   ```
   npm install
   ```

3. Configure as variáveis de ambiente conforme descrito acima.

4. Execute o servidor de desenvolvimento:
   ```
   npm run dev
   ```

5. O servidor estará disponível em `http://localhost:3000`.

## Implantação na Vercel

1. Faça fork ou clone deste repositório para sua conta GitHub.

2. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.

3. Clique em "New Project" e selecione o repositório.

4. Configure as variáveis de ambiente na interface da Vercel:
   - `UTMIFY_API_TOKEN`
   - `SAMCART_WEBHOOK_SECRET`
   - `RETRY_ATTEMPTS`
   - `RETRY_DELAY`
   - `LOG_LEVEL`

5. Clique em "Deploy" e aguarde a conclusão da implantação.

6. Após a implantação, você receberá uma URL para o seu projeto (ex: `https://seu-projeto.vercel.app`).

## Configuração do Webhook na SamCart

1. Acesse o painel administrativo da SamCart.

2. Navegue até a seção de integrações ou webhooks.

3. Adicione um novo webhook com a URL da sua aplicação implantada:
   ```
   https://seu-projeto.vercel.app/api/webhook/samcart
   ```

4. Configure os eventos que devem acionar o webhook (geralmente eventos relacionados a pedidos, como criação, pagamento, reembolso, etc.).

5. Salve as configurações e teste o webhook.

## Testes

Para testar a integração localmente:

```
node tests/utmify-integration.js
```

Este script simula o recebimento de um webhook da SamCart e o envio dos dados para a UTMify.

## Segurança

- Todas as comunicações são realizadas via HTTPS.
- Os webhooks podem ser validados usando HMAC para garantir a autenticidade.
- Tokens e segredos são armazenados como variáveis de ambiente, não no código-fonte.

## Suporte

Para suporte ou dúvidas, entre em contato através das issues do GitHub ou pelo e-mail de suporte.

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.
