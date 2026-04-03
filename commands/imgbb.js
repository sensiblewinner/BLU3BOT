// commands/imgbb.js - FIXED
const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const axios = require('axios');
const FormData = require('form-data');

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
        'imgbb',
        'Upload images to ImgBB',
        '.imgbb [reply to image]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage) {
                await react('❌');
                return reply('❌ Reply to an image with .imgbb');
            }

            const quotedImageMessage = quotedMessage.imageMessage;
            if (!quotedImageMessage) {
                await react('❌');
                return reply('❌ Quoted message is not an image');
            }

            if (!process.env.IMGBB_API_KEY) {
                await react('❌');
                return reply('❌ ImgBB API key not configured. Set IMGBB_API_KEY in Secrets.');
            }

            try {
                await react('📷');
                await reply('🔄 Uploading...');

                const mediaBuffer = await downloadMediaMessage(
                    {
                        key: {
                            remoteJid: from,
                            fromMe: false,
                            id: message.message?.extendedTextMessage?.contextInfo?.stanzaId
                        },
                        message: quotedMessage
                    },
                    'buffer',
                    {}
                );

                if (!mediaBuffer) {
                    await react('❌');
                    return reply('❌ Failed to download image');
                }

                const imageBase64 = mediaBuffer.toString('base64');

                const formData = new FormData();
                formData.append('image', imageBase64);
                formData.append('key', process.env.IMGBB_API_KEY);

                const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
                    headers: formData.getHeaders(),
                    timeout: 30000
                });

                const data = response.data;
                if (!data.success) {
                    throw new Error(data.error?.message || 'Upload failed');
                }

                const imageData = data.data;

                const successMessage = `📷 *ImgBB Upload*\n\n🔗 ${imageData.url}\n\n📊 ${(imageData.size / 1024).toFixed(1)}KB • ${imageData.width}×${imageData.height} • ${imageData.image.extension.toUpperCase()}\n\n✅ Upload successful`;

                await reply(successMessage);
                await react('✅');

            } catch (error) {
                console.error('ImgBB upload error:', error);
                await react('❌');

                let errorMessage = '❌ Upload failed';
                if (error.response?.data?.error?.message) {
                    errorMessage += `: ${error.response.data.error.message}`;
                } else if (error.code === 'ECONNABORTED') {
                    errorMessage += ': Timeout';
                } else {
                    errorMessage += `: ${error.message}`;
                }

                await reply(errorMessage);
            }
        }
    ),
    aliases: ['upload', 'imghost']
};
