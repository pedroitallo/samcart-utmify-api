/**
 * Middleware de autenticação para webhooks
 * 
 * Este módulo fornece middleware para validar a autenticidade
 * dos webhooks recebidos da SamCart.
 */

const { verifyWebhookSignature } = require('../lib/utils/hmac');
const logger = require('../lib/utils/logger');

/**
 * Middleware para validar a assinatura do webhook da SamCart
 * 
 * @param {Object} req - Objeto de requisição do Next.js
 * @param {Object} res - Objeto de resposta do Next.js
 * @param {Function} next - Função para prosseguir para o próximo handler
 */
const validateSamCartWebhook = (req, res, next) => {
  try {
    // Obtém a assinatura do header
    const signature = req.headers['x-samcart-signature'];
    
    // Converte o corpo para string (se já não for)
    const rawBody = typeof req.body === 'string' 
      ? req.body 
      : JSON.stringify(req.body);
    
    // Verifica a assinatura
    const isValid = verifyWebhookSignature(signature, rawBody);
    
    if (!isValid) {
      logger.warn('Webhook com assinatura inválida rejeitado');
      return res.status(401).json({ error: 'Assinatura inválida' });
    }
    
    // Se a assinatura for válida, prossegue
    return next();
  } catch (error) {
    logger.error('Erro ao validar webhook', { error: error.message });
    return res.status(500).json({ error: 'Erro interno ao validar webhook' });
  }
};

module.exports = {
  validateSamCartWebhook
};
