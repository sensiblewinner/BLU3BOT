// commands/antiviewonce.js
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

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
        'vv',
        'Open view-once messages secretly — delivered only to owner DM',
        '.vv [reply to view-once]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;

            if (!quotedMessage) {
                await reply('⚠️ Reply to a view-once message first, then use .vv');
                return;
            }

            const ownerJid = context.ownerJid || context.config?.OWNER_NUMBER;

            try {
                let mediaBuffer;
                let mediaType;
                let caption = '';

                const tryExtract = async (msgObj, type) => {
                    const stream = await downloadContentFromMessage(msgObj, type);
                    let buf = Buffer.from([]);
                    for await (const chunk of stream) buf = Buffer.concat([buf, chunk]);
                    return buf;
                };

                if (quotedMessage.viewOnceMessage?.message?.imageMessage) {
                    const media = quotedMessage.viewOnceMessage.message.imageMessage;
                    caption = media.caption || '';
                    mediaBuffer = await tryExtract(media, 'image');
                    mediaType = 'image';
                } else if (quotedMessage.viewOnceMessage?.message?.videoMessage) {
                    const media = quotedMessage.viewOnceMessage.message.videoMessage;
                    caption = media.caption || '';
                    mediaBuffer = await tryExtract(media, 'video');
                    mediaType = 'video';
                } else if (quotedMessage.viewOnceMessageV2?.message?.imageMessage) {
                    const media = quotedMessage.viewOnceMessageV2.message.imageMessage;
                    caption = media.caption || '';
                    mediaBuffer = await tryExtract(media, 'image');
                    mediaType = 'image';
                } else if (quotedMessage.viewOnceMessageV2?.message?.videoMessage) {
                    const media = quotedMessage.viewOnceMessageV2.message.videoMessage;
                    caption = media.caption || '';
                    mediaBuffer = await tryExtract(media, 'video');
                    mediaType = 'video';
                } else {
                    await reply('❌ No view-once media found. The message may have expired.');
                    return;
                }

                const header = `👁️ *VIEW-ONCE UNLOCKED*\n\n_Sender:_ @${(message.key.participant || message.key.remoteJid || '').split('@')[0]}\n_Chat:_ ${from.endsWith('@g.us') ? 'Group' : 'DM'}${caption ? `\n_Caption:_ ${caption}` : ''}\n\n_Delivered silently to owner_`;

                if (mediaType === 'image') {
                    await Blu3Bot.sendMessage(ownerJid, { image: mediaBuffer, caption: header });
                } else {
                    await Blu3Bot.sendMessage(ownerJid, { video: mediaBuffer, caption: header });
                }

            } catch (error) {
                console.error('Antiviewonce error:', error);
                await reply('❌ Failed to open view-once. It may have already expired.');
            }
        }
    ),
    ownerOnly: true,
    stealth: true
};
