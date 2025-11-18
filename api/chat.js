import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const supabase = createClient(
    'https://llznggdiaknxtqglpeot.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsem5nZ2RpYWtueHRxZ2xwZW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzc4NzksImV4cCI6MjA3ODI1Mzg3OX0.W1AxyLapjz3V8jwBcxUQAUhc3buPya1jb-OdvwKltf8'
);

export default async function handler(req, res) {
    // CORS
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
        const { message, image, sessionId, userId } = req.body;

        if (!message && !image) {
            return res.status(400).json({ error: 'Message or image required' });
        }

        // Construiește mesajul pentru OpenAI
        const messages = [
            {
                role: 'system',
                content: `Ești Super AI, asistentul virtual pentru SuperParty - companie de petreceri pentru copii cu personaje animate (Elsa, Spider-Man, etc.). 

Răspunde DOAR în ROMÂNĂ, prietenos și profesional. 

Informații despre SuperParty:
- Oferim petreceri cu animatori profesioniști
- Personaje: Elsa, Anna, Spider-Man, Batman, Prințese, Supereroi
- Pachete: Standard (1h, 1 animator), Premium (2h, 2 animatori), VIP (3h, 3 animatori + surprize)
- Contact: 0728 242 214, contact@superparty.ro
- Website: superpartybyai.ro

Dacă nu știi răspunsul exact, recomandă să contacteze echipa.`
            }
        ];

        // Adaugă mesajul utilizatorului (cu sau fără imagine)
        if (image) {
            messages.push({
                role: 'user',
                content: [
                    { type: 'text', text: message || 'Scanează acest formular și extrage datele.' },
                    { type: 'image_url', image_url: { url: image } }
                ]
            });
        } else {
            messages.push({
                role: 'user',
                content: message
            });
        }

        // Apel OpenAI
        const completion = await openai.chat.completions.create({
            model: image ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
            messages: messages,
            max_tokens: image ? 1000 : 500,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        // Verifică dacă AI-ul nu a putut răspunde (salvează în unanswered_questions)
        const lowerMessage = message?.toLowerCase() || '';
        const lowerResponse = aiResponse.toLowerCase();
        
        const uncertainPhrases = ['nu știu', 'nu am informații', 'nu pot', 'contactează', 'nu găsesc'];
        const isUncertain = uncertainPhrases.some(phrase => lowerResponse.includes(phrase));

        if (isUncertain && !image) {
            // Salvează întrebarea ca nerezolvată
            await supabase.from('unanswered_questions').insert({
                question: message,
                session_id: sessionId || null,
                user_id: userId || null,
                answered: false
            });
        }

        return res.status(200).json({
            success: true,
            response: aiResponse,
            model: completion.model
        });

    } catch (error) {
        console.error('Chat error:', error);
        return res.status(500).json({ 
            error: error.message,
            details: error.response?.data || 'No details'
        });
    }
}
