/**
 * Endpoint para receber webhooks da SamCart
 * 
 * Este endpoint recebe os dados de vendas da SamCart via webhook,
 * processa-os e os envia para a API da UTMify.
 */

import { validateSamCartWebhook } from '../../../middleware/auth';
import { validateSamCartWebhook as validateWebhookData } from '../../../lib/utils/validator';
import { mapSamCartToUtmify } from '../../../lib/utmify/mapper';
import UtmifyClient from '../../../lib/utmify/client';
import logger from '../../../lib/utils/logger';

// Logger específico para o endpoint de webhook
const webhookLogger = logger.withContext({ endpoint: 'samcart-webhook' });

// Cliente da UTMify
const utmifyClient = new UtmifyClient();

/**
 * Handler para o endpoint de webhook da SamCart
 */
export default async function handler(req, res) {
  // Verifica se o método é POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    webhookLogger.info('Webhook recebido da SamCart');

    // Extrai os dados do corpo da requisição
    const webhookData = req.body;
    
    // Valida a estrutura dos dados
    if (!validateWebhookData(webhookData)) {
      webhookLogger.warn('Dados de webhook inválidos', { data: webhookData });
      return res.status(400).json({ error: 'Dados inválidos ou incompletos' });
    }

    // Extrai a URL do checkout (para parâmetros UTM)
    const checkoutUrl = webhookData.checkout_url || '';

    // Mapeia os dados para o formato da UTMify
    const utmifyData = mapSamCartToUtmify(webhookData, checkoutUrl);
    
    webhookLogger.info('Dados mapeados com sucesso', { 
      orderId: utmifyData.orderId,
      status: utmifyData.status 
    });

    // Envia os dados para a UTMify
    const response = await utmifyClient.sendOrder(utmifyData);
    
    webhookLogger.info('Dados enviados com sucesso para UTMify', { 
      orderId: utmifyData.orderId,
      response 
    });

    // Retorna sucesso
    return res.status(200).json({ 
      success: true, 
      message: 'Dados processados e enviados com sucesso' 
    });
  } catch (error) {
    webhookLogger.error('Erro ao processar webhook', { 
      error: error.message,
      stack: error.stack 
    });

    // Retorna erro
    return res.status(500).json({ 
      error: 'Erro ao processar webhook',
      message: error.message 
    });
  }
}

// Middleware para validar a assinatura do webhook
// Comentado por enquanto, pois precisamos conhecer melhor a estrutura dos webhooks da SamCart
// export const config = {
//   api: {
//     bodyParser: {
//       raw: {
//         type: 'application/json',
//       },
//     },
//   },
// };

// // Aplica o middleware de validação
// export default function wrappedHandler(req, res) {
//   return validateSamCartWebhook(req, res, () => handler(req, res));
// }
