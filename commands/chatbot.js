// commands/chatbot.js
const axios = require('axios');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

module.exports = {
    command: new Command(
        'chatbot',
        'Toggle AI chatbot in private chats',
        '.chatbot [on/off]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🤖');
            
            // FIXED: Proper owner check
            const ownerNumber = '254745469050'; // Your number without @c.us
            const senderNumber = context.sender?.replace('@c.us', '') || context.sender;
            
            console.log('🔍 Owner check:', {
                sender: context.sender,
                senderNumber: senderNumber,
                ownerNumber: ownerNumber,
                isOwner: senderNumber === ownerNumber
            });

            if (senderNumber !== ownerNumber) {
                await reply('❌ Owner only command!');
                return;
            }

            const action = args[0]?.toLowerCase();
            
            if (!action || (action !== 'on' && action !== 'off')) {
                await reply(`🤖 *CHATBOT SETTINGS*\n\nUsage: .chatbot on/off\n\n*Current Status:* ${global.chatbotEnabled ? '🟢 ON' : '🔴 OFF'}`);
                return;
            }

            global.chatbotEnabled = action === 'on';
            
            const statusMessage = global.chatbotEnabled ? 
                '🟢 *Chatbot Activated*\n\nAI will respond to messages in private chats.' :
                '🔴 *Chatbot Deactivated*\n\nAI responses disabled.';
            
            await reply(statusMessage);
        }
    )
    // REMOVED the duplicate execute function
};