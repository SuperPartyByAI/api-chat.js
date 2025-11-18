import { createClient } from '@supabase/supabase-js';

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
        const { userId, action } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        if (action !== 'approve' && action !== 'reject') {
            return res.status(400).json({ error: 'Action must be "approve" or "reject"' });
        }

        const supabaseUrl = 'https://llznggdiaknxtqglpeot.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsem5nZ2RpYWtueHRxZ2xwZW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Nzc4NzksImV4cCI6MjA3ODI1Mzg3OX0.W1AxyLapjz3V8jwBcxUQAUhc3buPya1jb-OdvwKltf8';
        
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (action === 'approve') {
            // Approve user
            const { data, error } = await supabase
                .from('registered_users')
                .update({ approved: true })
                .eq('id', userId)
                .select();

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ 
                success: true, 
                message: 'User approved successfully',
                user: data[0]
            });

        } else {
            // Reject (delete) user
            const { error } = await supabase
                .from('registered_users')
                .delete()
                .eq('id', userId);

            if (error) {
                console.error('Supabase error:', error);
                return res.status(500).json({ error: error.message });
            }

            return res.status(200).json({ 
                success: true, 
                message: 'User rejected and removed'
            });
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message });
    }
}
