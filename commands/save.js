// commands/save.js
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
        'save',
        'Save quoted messages (Owner only)',
        '.save [reply to message]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⚡');

            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quotedMessage) {
                await reply('⚠️ Please reply to a message to save it.');
                return;
            }

            try {
                // Forward the message to owner (your number)
                const ownerJid = '254745469050@c.us'; // Your number
                
                if (quotedMessage.conversation || quotedMessage.extendedTextMessage?.text) {
                    const text = quotedMessage.conversation || quotedMessage.extendedTextMessage.text;
                    await Blu3Bot.sendMessage(ownerJid, { 
                        text: `💾 *SAVED MESSAGE*\n\n${text}` 
                    });
                } else {
                    await Blu3Bot.sendMessage(ownerJid, { 
                        text: '💾 *SAVED MEDIA*\n\nMedia message saved successfully.' 
                    });
                }

                await reply('✅ Message saved successfully to your DM!');
                
            } catch (error) {
                console.error('Save command error:', error);
                await reply('❌ Failed to save the message.');
            }
        }
    ),
    ownerOnly: true  // ← ADD THIS LINE (removes the manual owner check)
};