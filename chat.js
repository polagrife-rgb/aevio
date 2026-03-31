exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { messages, apiKey } = JSON.parse(event.body);

  const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Aevio, une agence belge spécialisée dans la création de chatbots IA sur mesure pour les PME.

Ton rôle : répondre aux questions des visiteurs du site avec professionnalisme et chaleur. Tu peux parler de :
- Les services d'Aevio : création de chatbots IA personnalisés, intégration en 48h, suivi mensuel
- Les tarifs : Starter à 499€ (setup unique), Business à 499€ + 149€/mois, Premium sur devis
- Les avantages : disponibilité 24/7, réponse en moins de 2s, 100% personnalisé, livraison en 48h
- La localisation : basé en Belgique, francophone, connaît le marché belge
- Garantie : satisfait ou remboursé 14 jours

Sois concis (max 3 phrases), chaleureux, et encourage toujours à prendre contact ou demander une démo gratuite. Réponds toujours en français.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || 'Erreur API' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply: data.content[0].text })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
