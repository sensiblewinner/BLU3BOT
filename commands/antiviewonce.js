// commands/antiviewonce.js
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

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
        'Open view-once messages secretly',
        '.vv [reply to view-once]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👁️');

            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quotedMessage) {
                await reply('⚠️ Please reply to a view-once message with .vv');
                return;
            }

            try {
                let mediaBuffer;
                let mediaType;
                let caption = '';

                if (quotedMessage.viewOnceMessage?.message?.imageMessage) {
                    mediaType = 'image';
                    const media = quotedMessage.viewOnceMessage.message.imageMessage;
                    caption = media.caption || '';
                    
                    const stream = await downloadContentFromMessage(media, 'image');
                    mediaBuffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
                    }
                    
                } else if (quotedMessage.viewOnceMessage?.message?.videoMessage) {
                    mediaType = 'video';
                    const media = quotedMessage.viewOnceMessage.message.videoMessage;
                    caption = media.caption || '';
                    
                    const stream = await downloadContentFromMessage(media, 'video');
                    mediaBuffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
                    }
                    
                } else if (quotedMessage.viewOnceMessageV2?.message?.imageMessage) {
                    mediaType = 'image';
                    const media = quotedMessage.viewOnceMessageV2.message.imageMessage;
                    caption = media.caption || '';
                    
                    const stream = await downloadContentFromMessage(media, 'image');
                    mediaBuffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
                    }
                    
                } else if (quotedMessage.viewOnceMessageV2?.message?.videoMessage) {
                    mediaType = 'video';
                    const media = quotedMessage.viewOnceMessageV2.message.videoMessage;
                    caption = media.caption || '';
                    
                    const stream = await downloadContentFromMessage(media, 'video');
                    mediaBuffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
                    }
                    
                } else {
                    await reply('❌ No view-once message found. Reply to a view-once image/video.');
                    return;
                }

                // Send to owner privately (your number)
                const ownerJid = '254745469050@c.us'; // Your number
                
                if (mediaType === 'image') {
                    await Blu3Bot.sendMessage(ownerJid, {
                        image: mediaBuffer,
                        caption: `👁️ *VIEW-ONCE OPENED*\n\n${caption}\n\n_Opened secretly without sender knowing_`
                    });
                } else if (mediaType === 'video') {
                    await Blu3Bot.sendMessage(ownerJid, {
                        video: mediaBuffer,
                        caption: `👁️ *VIEW-ONCE OPENED*\n\n${caption}\n\n_Opened secretly without sender knowing_`
                    });
                }

                // Send confirmation to user (but not the actual media)
                await reply('✅ View-once message opened and sent to your DM!');
                
            } catch (error) {
                console.error('Antiviewonce error:', error);
                await reply('❌ Failed to open view-once message. It may have expired.');
            }
        }
    ),
    ownerOnly: true  // ← ADD THIS LINE (removes the manual owner check)
};