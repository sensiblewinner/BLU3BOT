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
        'Save a quoted message silently to owner DM',
        '.save [reply to message]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quotedMessage) {
                await reply('⚠️ Please reply to a message to save it.');
                return;
            }

            try {
                const ownerJid = context.ownerJid || context.config?.OWNER_NUMBER;

                if (quotedMessage.conversation || quotedMessage.extendedTextMessage?.text) {
                    const text = quotedMessage.conversation || quotedMessage.extendedTextMessage.text;
                    await Blu3Bot.sendMessage(ownerJid, {
                        text: `💾 *SAVED MESSAGE*\n\n${text}`
                    });
                } else if (quotedMessage.imageMessage) {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
                    let buf = Buffer.from([]);
                    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                    await Blu3Bot.sendMessage(ownerJid, {
                        image: buf,
                        caption: `💾 *SAVED IMAGE*`
                    });
                } else if (quotedMessage.videoMessage) {
                    const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
                    const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
                    let buf = Buffer.from([]);
                    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                    await Blu3Bot.sendMessage(ownerJid, {
                        video: buf,
                        caption: `💾 *SAVED VIDEO*`
                    });
                } else {
                    await Blu3Bot.sendMessage(ownerJid, {
                        text: '💾 *SAVED MEDIA*\n\nMedia type saved (unsupported inline preview).'
                    });
                }

                await reply('✅ Saved to your personal DM.');
            } catch (error) {
                console.error('Save command error:', error);
                await reply('❌ Failed to save the message.');
            }
        }
    ),
    ownerOnly: true,
    stealth: true
};
