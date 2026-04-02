// commands/savestatus.js
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const fs = require('fs');
const path = require('path');

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
        'savestatus',
        'Save status media to chat',
        '.savestatus [reply to status]',
        'media',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💾');
            
            // Owner check
            if (context.sender !== context.config?.OWNER_NUMBER) {
                await reply('❌ Owner only command!');
                return;
            }

            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quotedMessage) {
                await reply('⚠️ Please reply to a status media to save it.');
                return;
            }

            // Check if it's from status
            const isFromStatus = message.message?.extendedTextMessage?.contextInfo?.remoteJid === 'status@broadcast';
            
            if (!isFromStatus) {
                await reply('❌ You can only save media from status updates.');
                return;
            }

            try {
                if (quotedMessage.imageMessage) {
                    const imageCaption = quotedMessage.imageMessage.caption || '';
                    
                    // Download image
                    const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    
                    await Blu3Bot.sendMessage(from, {
                        image: buffer,
                        caption: `💾 *SAVED FROM STATUS*\n\n${imageCaption}`
                    }, { quoted: message });
                    
                } else if (quotedMessage.videoMessage) {
                    const videoCaption = quotedMessage.videoMessage.caption || '';
                    
                    // Download video
                    const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
                    let buffer = Buffer.from([]);
                    for await (const chunk of stream) {
                        buffer = Buffer.concat([buffer, chunk]);
                    }
                    
                    await Blu3Bot.sendMessage(from, {
                        video: buffer,
                        caption: `💾 *SAVED FROM STATUS*\n\n${videoCaption}`
                    }, { quoted: message });
                    
                } else {
                    await reply('❌ Only images and videos from status can be saved.');
                    return;
                }
                
                await reply('✅ Status media saved successfully!');
                
            } catch (error) {
                console.error('Save status error:', error);
                await reply('❌ Failed to save status media. Please try again.');
            }
        }
    ),
    execute: async (reply, react, from, message, args, Blu3Bot, context) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot, context);
    }
};