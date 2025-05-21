/**
 * Utilitário para validação de autenticidade de webhooks via HMAC
 * 
 * Este módulo fornece funções para verificar a autenticidade dos webhooks
 * recebidos da SamCart, utilizando o algoritmo HMAC-SHA256.
 */

const crypto = require('crypto');
const config = require('../config');
const logger = require('./logger');

/**
 * Verifica a autenticidade de um webhook da SamCart
 * 
 * @param {string} signature - Assinatura HMAC recebida no header
 * @param {string} body - Corpo da requisição em formato string
 * @returns {boolean} - Verdadeiro se a assinatura for válida
 */
const verifyWebhookSignature = (signature, body) => {
  try {
    // Se não houver segredo configurado, não podemos validar
    if (!config.samcart.webhookSecret) {
      logger.warn('Segredo de webhook não configurado, pulando validação de assinatura');
      return config.env.isDevelopment; // Em desenvolvimento, permitimos sem validação
    }

    // Se não houver assinatura, a requisição é inválida
    if (!signature) {
      logger.warn('Assinatura de webhook ausente');
      return false;
    }

    // Calculamos o HMAC do corpo da requisição
    const hmac = crypto.createHmac('sha256', config.samcart.webhookSecret);
    const calculatedSignature = hmac.update(body).digest('hex');

    // Comparamos com a assinatura recebida (comparação segura contra timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );

    if (!isValid) {
      logger.warn('Assinatura de webhook inválida', {
        receivedSignature: signature,
        calculatedSignature,
      });
    }

    return isValid;
  } catch (error) {
    logger.error('Erro ao verificar assinatura de webhook', { error: error.message });
    return false;
  }
};

module.exports = {
  verifyWebhookSignature,
};
