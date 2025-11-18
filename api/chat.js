export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;
    const lastMessage = messages[messages.length - 1];
    
    // Răspuns simplu
    const response = {
      choices: [{
        message: {
          content: `Bună! Îmi pare rău, dar nu am informații specifice despre "${lastMessage.content}" în baza mea de cunoștințe.\n\n💡 Pentru detalii exacte, contactează echipa SuperParty:\n\n📞 Telefon: 0728 242 214\n📧 Email: contact@superparty.ro\n🌐 Website: superpartybyai.ro`
        }
      }]
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: error.message,
      choices: [{
        message: {
          content: '❌ A apărut o eroare tehnică. Te rog încearcă din nou!'
        }
      }]
    });
  }
}
