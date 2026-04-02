// commands/return.js
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
        'return',
        'Display raw message data (Owner only)',
        '.return [reply to message]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            // Owner check
            if (context.sender !== context.config?.OWNER_NUMBER) {
                await reply('❌ Owner only command!');
                return;
            }

            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quotedMessage) {
                await reply('⚠️ Please reply to a message to use this command.');
                return;
            }

            try {
                await react('⚡');
                
                const jsonString = JSON.stringify(quotedMessage, null, 2);
                
                // Split if too long
                if (jsonString.length <= 2000) {
                    await reply(`\`\`\`json\n${jsonString}\n\`\`\``);
                } else {
                    // Send in chunks
                    const chunks = jsonString.match(/[\s\S]{1,1500}/g) || [];
                    for (const chunk of chunks) {
                        await reply(`\`\`\`json\n${chunk}\n\`\`\``);
                    }
                }
                
            } catch (error) {
                console.error('Return command error:', error);
                await reply('❌ Error processing the message.');
            }
        }
    ),
    execute: async (reply, react, from, message, args, Blu3Bot, context) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot, context);
    }
};