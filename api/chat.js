import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://llznggdiaknxtqglpeot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsem5nZ2RpYWtueHRxZ2xwZW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzc4NzksImV4cCI6MjA3ODI1Mzg3OX0.W1AxyLapjz3V8jwBcxUQAUhc3buPya1jb-OdvwKltf8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
    const { messages, userId, sessionId } = req.body;
    const lastMessage = messages[messages.length - 1];
    const userQuestion = lastMessage.content.toLowerCase().trim();
    
    console.log('🔍 Searching Knowledge Base for:', userQuestion);
    
    let knowledgeFound = false;
    let kbAnswer = null;
    
    try {
      const { data: kbResults, error: kbError } = await supabase
        .from('knowledge_base')
        .select('*')
        .or(`question.ilike.%${userQuestion}%,keywords.cs.{${userQuestion}}`);
      
      if (kbError) {
        console.error('❌ KB Search Error:', kbError);
      } else if (kbResults && kbResults.length > 0) {
        knowledgeFound = true;
        kbAnswer = kbResults[0].answer;
        console.log('✅ Found in Knowledge Base!');
      } else {
        console.log('❌ Not found in Knowledge Base');
      }
    } catch (error) {
      console.error('❌ KB Search Exception:', error);
    }
    
    if (knowledgeFound && kbAnswer) {
      const response = {
        choices: [{
          message: {
            content: `🧠 **Din Creier AI:**\n\n${kbAnswer}`,
            source: 'knowledge_base'
          }
        }]
      };
      
      return res.status(200).json(response);
    }
    
    console.log('🌐 Using general knowledge...');
    
    const generalAnswer = `Bună! Îmi pare rău, dar nu am informații specifice despre "${lastMessage.content}" în baza mea de cunoștințe SuperParty.\n\n💡 **Sfat:** Contactează echipa SuperParty pentru detalii exacte!\n\n📞 **Contact:**\n- Telefon: 0728 242 214\n- Email: contact@superparty.ro\n- Website: superpartybyai.ro`;
    
    try {
      const { error: logError } = await supabase
        .from('unanswered_questions')
        .insert({
          question: lastMessage.content,
          user_id: userId || null,
          session_id: sessionId || null,
          answered: false,
          added_to_kb: false
        });
      
      if (logError) {
        console.error('❌ Failed to log unanswered question:', logError);
      } else {
        console.log('✅ Logged unanswered question');
      }
    } catch (error) {
      console.error('❌ Exception logging question:', error);
    }
    
    const response = {
      choices: [{
        message: {
          content: generalAnswer,
          source: 'general'
        }
      }]
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(500).json({ 
      error: error.message,
      choices: [{
        message: {
          content: '❌ A apărut o eroare tehnică. Te rog încearcă din nou!'
        }
      }]
    });
  }
}// Force redeploy - fix CORS

 
