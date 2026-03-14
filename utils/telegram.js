const fetch = require('node-fetch');

const sendTelegramMessage = async (chatId, message) => {
    try {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        if (!data.ok) {
            console.error('Telegram API Error:', data);
            throw new Error(data.description || 'Failed to send Telegram message');
        }
        return data;
    } catch (error) {
        console.error('Telegram sending error:', error);
        throw error;
    }
};

module.exports = { sendTelegramMessage };
