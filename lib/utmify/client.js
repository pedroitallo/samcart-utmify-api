/**
 * Cliente para comunicação com a API da UTMify
 * 
 * Este módulo é responsável por enviar os dados transformados
 * para a API da UTMify, gerenciando autenticação, retry e tratamento de erros.
 */

const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

// Logger específico para o cliente UTMify
const utmifyLogger = logger.withContext({ module: 'utmify-client' });

/**
 * Cliente para a API da UTMify
 */
class UtmifyClient {
  constructor(apiToken = config.utmify.apiToken) {
    this.apiToken = apiToken;
    this.apiUrl = config.utmify.apiUrl;
    this.retryAttempts = config.utmify.retryAttempts;
    this.retryDelay = config.utmify.retryDelay;
    
    // Validação básica
    if (!this.apiToken && config.env.isProduction) {
      throw new Error('Token de API da UTMify não configurado');
    }
  }

  /**
   * Envia dados de pedido para a API da UTMify
   * 
   * @param {Object} orderData - Dados do pedido no formato da UTMify
   * @returns {Promise<Object>} - Resposta da API
   */
  async sendOrder(orderData) {
    utmifyLogger.info('Enviando dados de pedido para UTMify', { 
      orderId: orderData.orderId,
      status: orderData.status 
    });
    
    return this._sendWithRetry(orderData);
  }

  /**
   * Envia requisição com mecanismo de retry
   * 
   * @param {Object} data - Dados a serem enviados
   * @returns {Promise<Object>} - Resposta da API
   * @private
   */
  async _sendWithRetry(data, attempt = 1) {
    try {
      const response = await axios.post(this.apiUrl, data, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-token': this.apiToken
        }
      });
      
      utmifyLogger.info('Resposta recebida da UTMify', { 
        status: response.status,
        orderId: data.orderId
      });
      
      return response.data;
    } catch (error) {
      const statusCode = error.response?.status;
      const errorData = error.response?.data;
      
      utmifyLogger.error('Erro ao enviar dados para UTMify', {
        attempt,
        statusCode,
        errorData,
        orderId: data.orderId,
        errorMessage: error.message
      });
      
      // Verifica se deve tentar novamente
      if (attempt < this.retryAttempts && this._isRetryableError(error)) {
        const delay = this._calculateRetryDelay(attempt);
        utmifyLogger.info(`Tentando novamente em ${delay}ms`, { attempt, orderId: data.orderId });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this._sendWithRetry(data, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * Verifica se o erro é passível de retry
   * 
   * @param {Error} error - Erro ocorrido
   * @returns {boolean} - Verdadeiro se o erro for passível de retry
   * @private
   */
  _isRetryableError(error) {
    // Erros de rede ou timeout são sempre retentáveis
    if (!error.response) {
      return true;
    }
    
    // Erros 5xx são problemas do servidor e podem ser retentados
    const statusCode = error.response.status;
    if (statusCode >= 500 && statusCode < 600) {
      return true;
    }
    
    // Erros 429 (Too Many Requests) também são retentáveis
    if (statusCode === 429) {
      return true;
    }
    
    // Outros erros 4xx são problemas com a requisição e não devem ser retentados
    return false;
  }

  /**
   * Calcula o delay para retry com backoff exponencial
   * 
   * @param {number} attempt - Número da tentativa atual
   * @returns {number} - Delay em milissegundos
   * @private
   */
  _calculateRetryDelay(attempt) {
    // Backoff exponencial com jitter para evitar thundering herd
    const baseDelay = this.retryDelay;
    const expDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.5 * expDelay;
    
    return Math.min(expDelay + jitter, 30000); // Máximo de 30 segundos
  }
}

module.exports = UtmifyClient;
