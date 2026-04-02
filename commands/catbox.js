// commands/catbox.js - FIXED with actual Catbox upload
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const axios = require('axios');
const FormData = require('form-data');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    command: new Command(
        'catbox',
        'Upload any file to Catbox and get a direct link',
        '.catbox [reply to file]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage) {
                await react('❌');
                return reply('❌ Please reply to any file (image, video, audio, document) to upload to Catbox.');
            }

            try {
                await react('📤');
                await reply('📤 *Uploading to Catbox...*');

                let buffer;
                let mimeType = 'application/octet-stream';
                let filename = 'file';

                if (quotedMessage.imageMessage) {
                    const stream = await downloadContentFromMessage(quotedMessage.imageMessage, 'image');
                    const chunks = [];
                    for await (const chunk of stream) chunks.push(chunk);
                    buffer = Buffer.concat(chunks);
                    mimeType = quotedMessage.imageMessage.mimetype || 'image/jpeg';
                    filename = 'image.jpg';
                } else if (quotedMessage.videoMessage) {
                    const stream = await downloadContentFromMessage(quotedMessage.videoMessage, 'video');
                    const chunks = [];
                    for await (const chunk of stream) chunks.push(chunk);
                    buffer = Buffer.concat(chunks);
                    mimeType = quotedMessage.videoMessage.mimetype || 'video/mp4';
                    filename = 'video.mp4';
                } else if (quotedMessage.audioMessage) {
                    const stream = await downloadContentFromMessage(quotedMessage.audioMessage, 'audio');
                    const chunks = [];
                    for await (const chunk of stream) chunks.push(chunk);
                    buffer = Buffer.concat(chunks);
                    mimeType = quotedMessage.audioMessage.mimetype || 'audio/mpeg';
                    filename = 'audio.mp3';
                } else if (quotedMessage.documentMessage) {
                    const stream = await downloadContentFromMessage(quotedMessage.documentMessage, 'document');
                    const chunks = [];
                    for await (const chunk of stream) chunks.push(chunk);
                    buffer = Buffer.concat(chunks);
                    mimeType = quotedMessage.documentMessage.mimetype || 'application/octet-stream';
                    filename = quotedMessage.documentMessage.fileName || 'document';
                } else {
                    await react('❌');
                    return reply('❌ Unsupported file type. Send an image, video, audio, or document.');
                }

                const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);

                // Upload to Catbox (free, no registration needed)
                const form = new FormData();
                form.append('reqtype', 'fileupload');
                form.append('fileToUpload', buffer, { filename, contentType: mimeType });

                const response = await axios.post('https://catbox.moe/user.php', form, {
                    headers: form.getHeaders(),
                    timeout: 60000
                });

                const url = response.data?.trim();
                if (!url || !url.startsWith('https://')) {
                    throw new Error('Upload failed — no URL returned');
                }

                await react('✅');
                await reply(
                    `✅ *Catbox Upload Successful!*\n\n` +
                    `🔗 *Link:* ${url}\n` +
                    `📁 *File:* ${filename}\n` +
                    `📊 *Size:* ${sizeMB} MB\n\n` +
                    `_Link is permanent and publicly accessible_\n*Powered by Blu3Bot*`
                );

            } catch (error) {
                console.error('Catbox upload error:', error.message);
                await react('❌');
                await reply(`❌ Upload failed: ${error.message}\n\nTry again or use a smaller file.`);
            }
        }
    )
};
