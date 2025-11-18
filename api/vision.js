export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { image, mimeType } = req.body;
    
    // Convertește base64 la buffer
    const imageBuffer = Buffer.from(image, 'base64');

    const response = await fetch('https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream'
      },
      body: imageBuffer
    });

    const data = await response.json();
    
    if (!response.ok) throw new Error(data.error || 'Vision API failed');
    
    // Format simplu pentru scanare
    res.status(200).json({
      content: [{
        type: 'text',
        text: JSON.stringify({
          descriere: data[0].generated_text,
          nota: "Pentru extragere completă de date din formular, adaugă API key Claude sau OpenAI"
        }, null, 2)
      }]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
