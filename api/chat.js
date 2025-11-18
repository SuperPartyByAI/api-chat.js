import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://llznggdiaknxtqglpeot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsem5nZ2RpYWtueHRxZ2xwZW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzc4NzksImV4cCI6MjA3ODI1Mzg3OX0.W1AxyLapjz3V8jwBcxUQAUhc3buPya1jb-OdvwKltf8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages, userId, sessionId } = req.body;
    const lastMessage = messages[messages.length - 1];
    
    // Salvează în tăcere (fără să zică utilizatorului)
    try {
      await supabase.from('unanswered_questions').insert({
        question: lastMessage.content,
        user_id: userId || null,
        session_id: sessionId || `anon-${Date.now()}`,
        answered: false,
        added_to_kb: false
      });
    } catch (err) {
      console.error('Save error:', err);
    }
    
    // Răspuns normal (nu zice că a salvat)
    const response = {
      choices: [{
        message: {
          content: `Bună! Îmi pare rău, dar nu am informații specifice despre "${lastMessage.content}" în baza mea de cunoștințe.\n\n💡 Pentru detalii exacte, contactează echipa SuperParty:\n\n📞 Telefon: 0728 242 214\n📧 Email: contact@superparty.ro\n🌐 Website: superpartybyai.ro`
        }
      }]
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    return res.status(500).json({ 
      choices: [{
        message: {
          content: '❌ A apărut o eroare tehnică. Te rog încearcă din nou!'
        }
      }]
    });
  }
}
