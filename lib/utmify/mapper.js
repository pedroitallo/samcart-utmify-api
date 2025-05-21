/**
 * Mapeador de dados da SamCart para o formato da UTMify
 * 
 * Este módulo é responsável por transformar os dados recebidos
 * da SamCart para o formato esperado pela API da UTMify.
 */

const config = require('../config');
const samcartParser = require('../samcart/parser');
const logger = require('../utils/logger');

// Logger específico para o mapeador
const mapperLogger = logger.withContext({ module: 'utmify-mapper' });

/**
 * Mapeia os dados de um pedido da SamCart para o formato da UTMify
 * 
 * @param {Object} samcartData - Dados do pedido da SamCart
 * @param {string} checkoutUrl - URL do checkout (para extração de UTMs)
 * @returns {Object} - Dados no formato da UTMify
 */
const mapSamCartToUtmify = (samcartData, checkoutUrl) => {
  try {
    mapperLogger.debug('Iniciando mapeamento de dados SamCart para UTMify', { 
      orderId: samcartData.order_id 
    });

    // Extrai parâmetros UTM da URL do checkout
    const trackingParameters = samcartParser.extractUtmParameters(checkoutUrl);

    // Mapeia os dados do cliente
    const customer = mapCustomer(samcartData.customer);

    // Mapeia os produtos
    const products = mapProducts(samcartData.products);

    // Mapeia os valores da comissão
    const commission = mapCommission(samcartData);

    // Mapeia as datas
    const createdAt = samcartParser.formatDateToUtc(samcartData.created_at);
    const approvedDate = samcartData.status === 'paid' || samcartData.status === 'completed' 
      ? samcartParser.formatDateToUtc(samcartData.paid_at || samcartData.created_at) 
      : null;
    const refundedAt = samcartData.status === 'refunded' 
      ? samcartParser.formatDateToUtc(samcartData.refunded_at || new Date()) 
      : null;

    // Constrói o objeto final no formato da UTMify
    const utmifyData = {
      orderId: samcartData.order_id,
      platform: config.samcart.platformName,
      paymentMethod: samcartParser.mapPaymentMethod(samcartData.payment_method),
      status: samcartParser.mapOrderStatus(samcartData.status),
      createdAt,
      approvedDate,
      refundedAt,
      customer,
      products,
      trackingParameters,
      commission,
      isTest: samcartData.is_test === true || false
    };

    mapperLogger.debug('Mapeamento concluído com sucesso', { 
      orderId: utmifyData.orderId,
      status: utmifyData.status
    });

    return utmifyData;
  } catch (error) {
    mapperLogger.error('Erro ao mapear dados para formato UTMify', { 
      error: error.message,
      orderId: samcartData?.order_id
    });
    throw error;
  }
};

/**
 * Mapeia os dados do cliente da SamCart para o formato da UTMify
 * 
 * @param {Object} samcartCustomer - Dados do cliente da SamCart
 * @returns {Object} - Dados do cliente no formato da UTMify
 */
const mapCustomer = (samcartCustomer = {}) => {
  return {
    name: samcartCustomer.name || samcartCustomer.full_name || '',
    email: samcartCustomer.email || '',
    phone: samcartCustomer.phone || null,
    document: samcartCustomer.document || samcartCustomer.tax_id || null,
    country: samcartCustomer.country || 'BR',
    ip: samcartCustomer.ip || null
  };
};

/**
 * Mapeia os produtos da SamCart para o formato da UTMify
 * 
 * @param {Array} samcartProducts - Lista de produtos da SamCart
 * @returns {Array} - Lista de produtos no formato da UTMify
 */
const mapProducts = (samcartProducts = []) => {
  if (!Array.isArray(samcartProducts)) {
    // Se não for um array, tenta converter para array com um item
    const singleProduct = samcartProducts && typeof samcartProducts === 'object' ? [samcartProducts] : [];
    return mapProducts(singleProduct);
  }

  return samcartProducts.map(product => ({
    id: product.id || product.product_id || '',
    name: product.name || product.product_name || '',
    planId: product.plan_id || null,
    planName: product.plan_name || null,
    quantity: parseInt(product.quantity || 1, 10),
    priceInCents: samcartParser.convertToCents(product.price || product.amount || 0)
  }));
};

/**
 * Mapeia os valores de comissão da SamCart para o formato da UTMify
 * 
 * @param {Object} samcartData - Dados do pedido da SamCart
 * @returns {Object} - Dados de comissão no formato da UTMify
 */
const mapCommission = (samcartData = {}) => {
  // Calcula o valor total em centavos
  const totalPriceInCents = samcartParser.convertToCents(samcartData.total || 0);
  
  // Calcula a taxa da gateway (assumindo um percentual padrão se não fornecido)
  const gatewayFeePercentage = samcartData.gateway_fee_percentage || 0.05; // 5% padrão
  const gatewayFeeInCents = Math.round(totalPriceInCents * gatewayFeePercentage);
  
  // Calcula a comissão do usuário (total - taxa)
  const userCommissionInCents = totalPriceInCents - gatewayFeeInCents;
  
  return {
    totalPriceInCents,
    gatewayFeeInCents,
    userCommissionInCents,
    currency: samcartData.currency || 'BRL'
  };
};

module.exports = {
  mapSamCartToUtmify
};
