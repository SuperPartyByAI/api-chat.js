export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1];
    
    // Format compatibil cu OpenAI/Claude
    const response = {
      choices: [{
        message: {
          content: `Bună! Am primit mesajul tău: "${lastMessage.content}"\n\n✅ Backend-ul funcționează!\n\n💡 Momentan sunt în modul de test. Pentru răspunsuri AI complete, vei avea nevoie de un API key de la Claude sau OpenAI când Cloudflare se repară în București.`
        }
      }]
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
