/**
 * Utilitário para validação de dados recebidos nos webhooks
 * 
 * Este módulo fornece funções para validar a estrutura e o conteúdo
 * dos dados recebidos nos webhooks da SamCart.
 */

const logger = require('./logger');

/**
 * Valida se um objeto contém todas as propriedades obrigatórias
 * 
 * @param {Object} data - Objeto a ser validado
 * @param {Array<string>} requiredFields - Lista de campos obrigatórios
 * @returns {boolean} - Verdadeiro se todos os campos obrigatórios estiverem presentes
 */
const validateRequiredFields = (data, requiredFields) => {
  if (!data || typeof data !== 'object') {
    logger.warn('Dados inválidos: não é um objeto', { data });
    return false;
  }

  const missingFields = requiredFields.filter(field => {
    const fieldParts = field.split('.');
    let current = data;
    
    for (const part of fieldParts) {
      if (current === undefined || current === null) {
        return true;
      }
      current = current[part];
    }
    
    return current === undefined || current === null;
  });

  if (missingFields.length > 0) {
    logger.warn('Campos obrigatórios ausentes', { missingFields });
    return false;
  }

  return true;
};

/**
 * Valida a estrutura básica de um webhook da SamCart
 * 
 * @param {Object} data - Dados do webhook
 * @returns {boolean} - Verdadeiro se a estrutura for válida
 */
const validateSamCartWebhook = (data) => {
  // Definição dos campos obrigatórios para um webhook da SamCart
  // Nota: Esta lista deve ser ajustada conforme a estrutura real dos webhooks da SamCart
  const requiredFields = [
    'order_id',
    'customer.email',
    'customer.name',
    'products',
    'total',
    'payment_method',
    'status'
  ];

  return validateRequiredFields(data, requiredFields);
};

module.exports = {
  validateRequiredFields,
  validateSamCartWebhook,
};
