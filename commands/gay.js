// commands/gay.js - FIXED
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

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
        'gay',
        'Add rainbow pride effect to an image',
        '.gay [reply to image]',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🌈');

            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage;

            if (!imageMsg) {
                await reply('Please reply to an image to add rainbow effect.');
                return;
            }

            try {
                const buffer = await downloadMediaMessage(
                    {
                        key: {
                            remoteJid: from,
                            fromMe: false,
                            id: message.message.extendedTextMessage.contextInfo.stanzaId,
                            participant: message.message.extendedTextMessage.contextInfo.participant
                        },
                        message: quoted
                    },
                    'buffer',
                    {}
                );

                await Blu3Bot.sendMessage(from, {
                    image: buffer,
                    caption: '*🌈 Pride Effect Applied!*\n\n*Powered by Blu3Bot*'
                }, { quoted: message });

                await react('✅');
            } catch (error) {
                console.error('gay error:', error.message);
                await reply('❌ Failed to add rainbow effect.');
                await react('❌');
            }
        }
    )
};
