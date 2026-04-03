// commands/setprofilepic.js - FIXED
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
        'setprofilepic',
        'Set bot profile picture',
        '.setprofilepic [reply to image]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🖼️');

            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMsg = quoted?.imageMessage;

            if (!imageMsg) {
                await reply('Please reply to an image to set as profile picture.');
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

                const botJid = Blu3Bot.user?.id || Blu3Bot.authState?.creds?.me?.id;
                await Blu3Bot.updateProfilePicture(botJid, buffer);
                await reply('✅ Profile picture updated successfully!');
                await react('✅');
            } catch (error) {
                console.error('setprofilepic error:', error.message);
                await reply('❌ Failed to update profile picture.');
                await react('❌');
            }
        }
    ),
    ownerOnly: true
};
