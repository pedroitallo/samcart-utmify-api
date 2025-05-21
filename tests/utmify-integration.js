/**
 * Script de teste para envio de dados para a UTMify
 * 
 * Este script simula o recebimento de um webhook da SamCart
 * e o envio dos dados para a UTMify, permitindo testar a integração.
 */

require('dotenv').config();
const UtmifyClient = require('../lib/utmify/client');
const { mapSamCartToUtmify } = require('../lib/utmify/mapper');
const logger = require('../lib/utils/logger');

// Dados de exemplo de um webhook da SamCart
const sampleWebhookData = {
  order_id: 'TEST-ORDER-123',
  created_at: new Date().toISOString(),
  paid_at: new Date().toISOString(),
  status: 'completed',
  payment_method: 'credit_card',
  total: 99.99,
  currency: 'BRL',
  checkout_url: 'https://checkout.samcart.com/products/example?utm_source=test&utm_medium=integration&utm_campaign=test_campaign',
  customer: {
    name: 'Cliente Teste',
    email: 'cliente@teste.com',
    phone: '11999999999',
    document: '12345678900',
    country: 'BR',
    ip: '127.0.0.1'
  },
  products: [
    {
      id: 'PROD-001',
      name: 'Produto Teste',
      quantity: 1,
      price: 99.99
    }
  ],
  is_test: true
};

/**
 * Função principal para testar a integração
 */
async function testUtmifyIntegration() {
  try {
    logger.info('Iniciando teste de integração com a UTMify');
    
    // Mapeia os dados para o formato da UTMify
    const utmifyData = mapSamCartToUtmify(
      sampleWebhookData, 
      sampleWebhookData.checkout_url
    );
    
    logger.info('Dados mapeados com sucesso', { 
      orderId: utmifyData.orderId,
      status: utmifyData.status 
    });
    
    // Cria o cliente da UTMify
    const utmifyClient = new UtmifyClient();
    
    // Envia os dados para a UTMify
    logger.info('Enviando dados para a UTMify...');
    const response = await utmifyClient.sendOrder(utmifyData);
    
    logger.info('Resposta da UTMify:', { response });
    logger.info('Teste concluído com sucesso!');
    
    return { success: true, response };
  } catch (error) {
    logger.error('Erro durante o teste de integração', { 
      error: error.message,
      stack: error.stack 
    });
    
    return { success: false, error: error.message };
  }
}

// Executa o teste se o script for chamado diretamente
if (require.main === module) {
  testUtmifyIntegration()
    .then(result => {
      console.log('Resultado do teste:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

module.exports = { testUtmifyIntegration };
