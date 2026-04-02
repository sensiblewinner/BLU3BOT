// commands/comics.js - FIXED
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
        'comics',
        'Add comic book effect',
        '.comics [reply to image]',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🖼️');
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage;

            if (!imageMsg) {
                await reply('Please reply to an image to convert to comic style.');
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

                // Return original image with comic caption
                await reply({
                    image: buffer,
                    caption: '*🖼️ Comic Style Applied!*\n\n*Powered by Blu3Bot*'
                });
            } catch (error) {
                await reply('❌ Failed to convert to comic style.');
            }
        }
    )
};