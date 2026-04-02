// commands/setgrouppp.js
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
        'setgrouppp',
        'Set the group profile picture',
        '.setgrouppp [reply to image]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🖼️');

            if (!from.endsWith('@g.us')) {
                await reply('❌ This command can only be used in groups.');
                return;
            }

            const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = quoted?.imageMessage ||
                message.message?.imageMessage;

            if (!isImage) {
                await reply('🖼️ *Set Group Profile Picture*\n\nUsage: Reply to an image and type `.setgrouppp`');
                return;
            }

            try {
                const meta = await Blu3Bot.groupMetadata(from);
                const botId = Blu3Bot.user.id.replace(/:\d+/, '');
                const botMember = meta.participants.find(p => p.id.includes(botId.split('@')[0]));
                if (!botMember || !['admin', 'superadmin'].includes(botMember.admin)) {
                    await reply('❌ I need to be an admin to change the group picture.');
                    return;
                }

                // Download the image
                const targetMsg = quoted
                    ? { message: quoted, key: message.message.extendedTextMessage.contextInfo.stanzaId }
                    : message;

                const imgBuffer = await downloadMediaMessage(
                    {
                        key: message.key,
                        message: quoted ? { imageMessage: quoted.imageMessage } : message.message
                    },
                    'buffer',
                    {},
                    { logger: { info: () => {}, warn: () => {}, error: () => {} }, reuploadRequest: Blu3Bot.updateMediaMessage }
                );

                await Blu3Bot.updateProfilePicture(from, imgBuffer);
                await reply(`✅ Group profile picture updated for *${meta.subject}*!`);
            } catch (err) {
                console.error('Setgrouppp error:', err.message);
                await reply('❌ Failed to update group picture. Make sure I am an admin and you replied to an image.');
            }
        }
    ),
    aliases: ['grppp', 'setgrouppic', 'grouppic']
};
