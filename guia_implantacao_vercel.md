# Guia de Implantação na Vercel

Este guia detalha o processo de implantação da integração SamCart-UTMify na plataforma Vercel, permitindo que o serviço esteja disponível publicamente para receber webhooks da SamCart.

## Pré-requisitos

Antes de iniciar a implantação, certifique-se de que você possui:

1. Uma conta na Vercel (gratuita ou paga)
2. Uma conta no GitHub, GitLab ou Bitbucket para hospedar o código-fonte
3. O arquivo ZIP com o código da integração (fornecido junto com este guia)
4. O token de API da UTMify (já fornecido: oqgnr6OQiXXoi3uS0iqLcXNYyHCxZFXWA8fW)
5. Um segredo para validação dos webhooks da SamCart (você pode gerar um)

## Passo a Passo para Implantação

### 1. Preparação do Repositório

1. Acesse sua conta no GitHub (ou GitLab/Bitbucket)
2. Crie um novo repositório (por exemplo, "samcart-utmify-integration")
3. Descompacte o arquivo ZIP fornecido
4. Faça upload dos arquivos para o repositório criado

### 2. Configuração na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta
2. Clique no botão "New Project" no dashboard
3. Importe o repositório que você criou no passo anterior
4. Na tela de configuração do projeto:
   - Framework Preset: selecione "Next.js"
   - Root Directory: mantenha o padrão (raiz do projeto)
   - Build Command: mantenha o padrão (next build)
   - Output Directory: mantenha o padrão (next)

5. Expanda a seção "Environment Variables" e adicione as seguintes variáveis:
   - `UTMIFY_API_TOKEN`: oqgnr6OQiXXoi3uS0iqLcXNYyHCxZFXWA8fW
   - `RETRY_ATTEMPTS`: 3
   - `RETRY_DELAY`: 1000
   - `SAMCART_WEBHOOK_SECRET`: [gere um segredo forte ou use um existente]
   - `LOG_LEVEL`: info

6. Clique no botão "Deploy" e aguarde a conclusão da implantação

### 3. Verificação da Implantação

1. Após a conclusão da implantação, a Vercel fornecerá uma URL para seu projeto (por exemplo, https://samcart-utmify-integration.vercel.app)
2. Acesse a URL fornecida para verificar se a aplicação está online
3. O endpoint para webhooks estará disponível em: `https://seu-dominio.vercel.app/api/webhook/samcart`

### 4. Configuração do Webhook na SamCart

1. Acesse o painel administrativo da SamCart
2. Navegue até a seção de integrações ou webhooks
3. Adicione um novo webhook com a URL completa do endpoint:
   ```
   https://seu-dominio.vercel.app/api/webhook/samcart
   ```
4. Configure os eventos que devem acionar o webhook:
   - Criação de pedido
   - Pagamento aprovado
   - Reembolso
   - Outros eventos relevantes para seu caso de uso
5. Se a SamCart oferecer a opção de configurar um segredo para o webhook, use o mesmo valor definido na variável `SAMCART_WEBHOOK_SECRET`

### 5. Teste da Integração

1. Realize uma venda de teste na SamCart
2. Verifique os logs na Vercel (seção "Logs" do seu projeto)
3. Acesse sua conta na UTMify para confirmar se os dados foram recebidos corretamente

## Manutenção e Monitoramento

- **Logs**: Acesse a seção "Logs" do seu projeto na Vercel para monitorar a atividade e identificar possíveis erros
- **Atualizações**: Para atualizar o código, basta fazer push das alterações para o repositório conectado à Vercel
- **Escalabilidade**: O plano gratuito da Vercel oferece recursos suficientes para a maioria dos casos de uso; para volumes maiores, considere fazer upgrade para um plano pago

## Solução de Problemas

Se encontrar problemas durante a implantação ou operação:

1. Verifique os logs na Vercel para identificar erros específicos
2. Confirme se todas as variáveis de ambiente estão configuradas corretamente
3. Teste o webhook da SamCart para garantir que está enviando dados no formato esperado
4. Verifique se o token da UTMify está ativo e correto

## Próximos Passos

Após a implantação bem-sucedida:

1. Considere configurar um domínio personalizado na Vercel para o endpoint
2. Implemente monitoramento adicional para acompanhar a saúde da integração
3. Configure alertas para ser notificado em caso de falhas na integração
