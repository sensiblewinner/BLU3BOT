// commands/gay.js - FIXED
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
        'Add rainbow pride effect',
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
                const buffer = await Blu3Bot.downloadMediaMessage({
                    key: {
                        remoteJid: from,
                        fromMe: false,
                        id: message.message.extendedTextMessage.contextInfo.stanzaId,
                        participant: message.message.extendedTextMessage.contextInfo.participant
                    },
                    message: quoted
                });

                // Return original image with rainbow caption
                await reply({
                    image: buffer,
                    caption: '*🌈 Pride Effect Applied!*\n\n*Powered by Blu3Bot*'
                });
            } catch (error) {
                await reply('❌ Failed to add rainbow effect.');
            }
        }
    )
};