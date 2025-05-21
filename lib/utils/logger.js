/**
 * Utilitário de logging para a integração SamCart-UTMify
 * 
 * Este módulo fornece funções para registro de logs padronizados
 * em toda a aplicação, facilitando o monitoramento e a depuração.
 */

const winston = require('winston');
const config = require('../config');

// Configuração do formato de logs
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  config.logging.format === 'json'
    ? winston.format.json()
    : winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
        }`;
      })
);

// Criação do logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
});

// Adiciona contexto aos logs
const addContext = (message, context) => {
  if (!context) return message;
  
  const contextStr = Object.entries(context)
    .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join(' ');
  
  return `${message} ${contextStr}`;
};

// Funções de log com suporte a contexto
module.exports = {
  debug: (message, context) => logger.debug(addContext(message, context)),
  info: (message, context) => logger.info(addContext(message, context)),
  warn: (message, context) => logger.warn(addContext(message, context)),
  error: (message, context) => logger.error(addContext(message, context)),
  
  // Função para criar um logger com contexto pré-definido
  withContext: (defaultContext) => ({
    debug: (message, context) => logger.debug(addContext(message, { ...defaultContext, ...context })),
    info: (message, context) => logger.info(addContext(message, { ...defaultContext, ...context })),
    warn: (message, context) => logger.warn(addContext(message, { ...defaultContext, ...context })),
    error: (message, context) => logger.error(addContext(message, { ...defaultContext, ...context })),
  }),
};
