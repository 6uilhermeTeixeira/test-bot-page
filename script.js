// ============================================
// CONFIGURAÇÃO - ALTERE AQUI A URL DO SEU N8N
// ============================================
const N8N_WEBHOOK_URL = 'https://synclead-n8n.gibuoa.easypanel.host/webhook/chatbot-html';

// Elementos do DOM
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// ID único da sessão (simula um usuário único)
const sessionId = 'user_' + Math.random().toString(36).substr(2, 9);

// Adicionar mensagem ao chat
function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    
    // Scroll para o final
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Mostrar indicador de digitação
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'typing-dot';
        typingDiv.appendChild(dot);
    }
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Remover indicador de digitação
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Enviar mensagem para o N8N
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Adicionar mensagem do usuário
    addMessage(message, true);
    userInput.value = '';
    
    // Desabilitar input enquanto processa
    userInput.disabled = true;
    sendButton.disabled = true;
    
    // Mostrar indicador de digitação
    showTypingIndicator();
    
    try {
        // Enviar para o N8N
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            })
        });
        
        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }
        
        const data = await response.json();
        
        // Remover indicador de digitação
        removeTypingIndicator();
        
        // Adicionar resposta do bot
        // Ajuste o caminho conforme a estrutura da sua resposta do N8N
        const botResponse = data.response || data.message || data.output || 'Desculpe, não entendi.';
        addMessage(botResponse, false);
        
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        removeTypingIndicator();
        addMessage('Desculpe, ocorreu um erro ao processar sua mensagem. Verifique se o webhook do N8N está configurado corretamente.', false);
    } finally {
        // Reabilitar input
        userInput.disabled = false;
        sendButton.disabled = false;
        userInput.focus();
    }
}

// Event Listeners
sendButton.addEventListener('click', sendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Mensagem de boas-vindas
window.addEventListener('load', () => {
    addMessage('Olá! Como posso te ajudar hoje?', false);
});