window.loadSimpleUnanswered = async function() {
    console.log('🚀 loadSimpleUnanswered - ÎNCĂRCARE prin backend Vercel!');
    
    try {
        console.log('📤 Fac request la backend...');
        const response = await fetch('https://api-chat-js-three.vercel.app/api/get-questions');
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error('Backend a returnat eroare: ' + response.status);
        }
        
        const result = await response.json();
        console.log('✅ Date primite de la backend:', result);
        
        // Update counter
        const count = result.count || 0;
        document.getElementById('simpleUnansweredCount').textContent = count;
        
        const container = document.getElementById('simpleUnansweredList');
        container.innerHTML = '';
        
        if (!result.questions || result.questions.length === 0) {
            console.log('ℹ️ Nu sunt întrebări');
            container.innerHTML = '<p style="color: #9ca3af; text-align: center; padding: 40px;">🎉 Nu există întrebări noi!</p>';
            alert('✅ Sincronizat! Nu există întrebări noi.');
            return;
        }
        
        console.log('📋 Afișez', result.questions.length, 'întrebări');
        result.questions.forEach(q => {
            const qCard = document.createElement('div');
            qCard.style.cssText = 'background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px;';
            qCard.innerHTML = `
                <div style="font-weight: 600; color: #92400e; margin-bottom: 5px;">❓ ${q.question}</div>
                <div style="font-size: 12px; color: #78350f;">
                    🕐 ${new Date(q.created_at).toLocaleString('ro-RO')}
                </div>
            `;
            container.appendChild(qCard);
        });
        
        alert('✅ Încărcat ' + count + ' întrebări de la utilizatori!');
        
    } catch (error) {
        console.error('💥 EROARE COMPLETĂ:', error);
        alert('❌ Eroare la încărcare: ' + error.message);
    }
};
