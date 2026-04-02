// commands/aiimg.js - FIXED
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
        'aiimg',
        'Enhance images with filters',
        '.aiimg [reply to image]',
        'media',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✨');
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage;

            if (!imageMsg) {
                await reply('Please reply to an image to enhance.');
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

                await Blu3Bot.sendMessage(from, {
                    image: buffer,
                    caption: '*✨ Enhanced Image*\n\n*Powered by Blu3Bot*'
                }, { quoted: message });
            } catch (error) {
                await reply('❌ Failed to enhance image.');
            }
        }
    )
};