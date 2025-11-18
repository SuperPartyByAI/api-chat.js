// /api/vision.js - OpenAI Vision Endpoint pentru Vercel

export default async function handler(req, res) {
  // Configurare CORS pentru frontend-ul tău
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', 'https://superpartybyai.ro');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Verifică că e POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Obține API key din environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return res.status(500).json({ 
        error: 'OpenAI API key not configured',
        details: 'Server configuration error - missing API key'
      });
    }

    // Preia imaginea și prompt-ul din request body
    const { image, prompt } = req.body;
    
    if (!image) {
      return res.status(400).json({ 
        error: 'Invalid request',
        details: 'Image data is required'
      });
    }

    // Pregătește mesajul pentru Vision API
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt || "Analizează această imagine și extrage toate informațiile relevante pentru un formular de eveniment (nume, telefon, adresă, data, ora, vârstă, tip eveniment, observații)."
          },
          {
            type: "image_url",
            image_url: {
              url: image // Data URL sau URL către imagine
            }
          }
        ]
      }
    ];

    console.log('Making OpenAI Vision API request');

    // Trimite request către OpenAI Vision
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}` // IMPORTANT: Format corect cu "Bearer "
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Model Vision (gpt-4o, gpt-4o-mini, gpt-4-turbo)
        messages: messages,
        max_tokens: 1000
      })
    });

    // Verifică răspunsul OpenAI
    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI Vision API Error:', errorData);
      
      return res.status(openaiResponse.status).json({
        error: 'OpenAI Vision API error',
        details: errorData.error?.message || 'Unknown error',
        status: openaiResponse.status
      });
    }

    // Parse răspunsul
    const data = await openaiResponse.json();
    
    // Extrage analiza imaginii
    const analysis = data.choices[0].message.content;

    // Returnează răspunsul
    return res.status(200).json({
      success: true,
      analysis: analysis,
      usage: data.usage // Include și info despre tokens folosiți
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}
