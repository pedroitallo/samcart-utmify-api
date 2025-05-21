/**
 * Processador de dados da SamCart
 * 
 * Este módulo é responsável por extrair e processar os dados
 * recebidos dos webhooks da SamCart, preparando-os para
 * transformação no formato da UTMify.
 */

const logger = require('../utils/logger');

/**
 * Extrai parâmetros UTM da URL do checkout
 * 
 * @param {string} checkoutUrl - URL do checkout da SamCart
 * @returns {Object} - Objeto com os parâmetros UTM extraídos
 */
const extractUtmParameters = (checkoutUrl) => {
  try {
    if (!checkoutUrl) {
      return {
        src: null,
        sck: null,
        utm_source: null,
        utm_campaign: null,
        utm_medium: null,
        utm_content: null,
        utm_term: null
      };
    }

    const url = new URL(checkoutUrl);
    const params = new URLSearchParams(url.search);

    return {
      src: params.get('src') || null,
      sck: params.get('sck') || null,
      utm_source: params.get('utm_source') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_medium: params.get('utm_medium') || null,
      utm_content: params.get('utm_content') || null,
      utm_term: params.get('utm_term') || null
    };
  } catch (error) {
    logger.warn('Erro ao extrair parâmetros UTM da URL', { 
      error: error.message, 
      checkoutUrl 
    });
    
    return {
      src: null,
      sck: null,
      utm_source: null,
      utm_campaign: null,
      utm_medium: null,
      utm_content: null,
      utm_term: null
    };
  }
};

/**
 * Converte valor monetário para centavos
 * 
 * @param {number|string} value - Valor monetário (ex: 99.99)
 * @returns {number} - Valor em centavos (ex: 9999)
 */
const convertToCents = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return Math.round(numValue * 100);
};

/**
 * Converte data para o formato UTC requerido pela UTMify
 * 
 * @param {string|Date} date - Data a ser convertida
 * @returns {string|null} - Data no formato 'YYYY-MM-DD HH:MM:SS' em UTC
 */
const formatDateToUtc = (date) => {
  if (!date) {
    return null;
  }
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const hours = String(dateObj.getUTCHours()).padStart(2, '0');
    const minutes = String(dateObj.getUTCMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    logger.warn('Erro ao formatar data para UTC', { error: error.message, date });
    return null;
  }
};

/**
 * Mapeia o método de pagamento da SamCart para o formato da UTMify
 * 
 * @param {string} samcartPaymentMethod - Método de pagamento da SamCart
 * @returns {string} - Método de pagamento no formato da UTMify
 */
const mapPaymentMethod = (samcartPaymentMethod) => {
  const methodMap = {
    'credit_card': 'credit_card',
    'creditcard': 'credit_card',
    'credit': 'credit_card',
    'boleto': 'boleto',
    'pix': 'pix',
    'paypal': 'paypal',
    'free': 'free_price'
  };
  
  const normalizedMethod = samcartPaymentMethod?.toLowerCase();
  return methodMap[normalizedMethod] || 'credit_card'; // Padrão para credit_card
};

/**
 * Mapeia o status do pedido da SamCart para o formato da UTMify
 * 
 * @param {string} samcartStatus - Status do pedido da SamCart
 * @returns {string} - Status no formato da UTMify
 */
const mapOrderStatus = (samcartStatus) => {
  const statusMap = {
    'pending': 'waiting_payment',
    'processing': 'waiting_payment',
    'completed': 'paid',
    'paid': 'paid',
    'declined': 'refused',
    'refunded': 'refunded',
    'chargeback': 'chargedback',
    'disputed': 'chargedback'
  };
  
  const normalizedStatus = samcartStatus?.toLowerCase();
  return statusMap[normalizedStatus] || 'waiting_payment'; // Padrão para waiting_payment
};

module.exports = {
  extractUtmParameters,
  convertToCents,
  formatDateToUtc,
  mapPaymentMethod,
  mapOrderStatus
};
