/**
 * Configurações da aplicação de integração SamCart-UTMify
 * 
 * Este arquivo centraliza todas as configurações da aplicação,
 * obtendo valores das variáveis de ambiente e definindo valores padrão
 * quando necessário.
 */

const config = {
  // Configurações da UTMify
  utmify: {
    apiToken: process.env.UTMIFY_API_TOKEN,
    apiUrl: 'https://api.utmify.com.br/api-credentials/orders',
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.RETRY_DELAY || '1000', 10),
  },
  
  // Configurações da SamCart
  samcart: {
    webhookSecret: process.env.SAMCART_WEBHOOK_SECRET,
    platformName: 'SamCart',
  },
  
  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
  },
  
  // Configurações do ambiente
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
  }
};

// Validação básica de configurações críticas
const validateConfig = () => {
  const requiredConfigs = [
    { key: 'utmify.apiToken', value: config.utmify.apiToken, env: 'UTMIFY_API_TOKEN' },
    { key: 'samcart.webhookSecret', value: config.samcart.webhookSecret, env: 'SAMCART_WEBHOOK_SECRET' },
  ];

  // Em ambiente de desenvolvimento, permitimos que algumas configurações sejam opcionais
  if (config.env.isProduction) {
    for (const { key, value, env } of requiredConfigs) {
      if (!value) {
        throw new Error(`Configuração obrigatória ausente: ${key} (${env})`);
      }
    }
  }
};

// Executamos a validação apenas em ambiente de produção
if (config.env.isProduction) {
  validateConfig();
}

module.exports = config;
