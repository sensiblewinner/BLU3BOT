// commands/qr.js — QR code generator
const axios = require('axios');

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
        'qr',
        'Generate a QR code for any text or URL',
        '.qr [text or URL]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📱');

            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const quotedText =
                quoted?.quotedMessage?.conversation ||
                quoted?.quotedMessage?.extendedTextMessage?.text || null;

            const text = args.join(' ').trim() || quotedText;

            if (!text) {
                await reply(
                    '📱 *QR Code Generator*\n\n' +
                    'Usage: `.qr [text or URL]`\n' +
                    'Example: `.qr https://example.com`\n\n' +
                    '_You can also reply to a message._'
                );
                return;
            }

            if (text.length > 900) {
                await reply('⚠️ Text too long for a QR code (max 900 characters).');
                return;
            }

            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&margin=20&data=${encodeURIComponent(text)}`;

            try {
                const imgRes = await axios.get(qrUrl, { responseType: 'arraybuffer', timeout: 15000 });
                const imgBuffer = Buffer.from(imgRes.data);

                await Blu3Bot.sendMessage(from, {
                    image: imgBuffer,
                    caption:
                        `📱 *QR Code Generated*\n\n` +
                        `📝 Content: ${text.length > 60 ? text.substring(0, 60) + '...' : text}\n` +
                        `📏 Size: 512×512`
                }, { quoted: message });

            } catch (err) {
                await reply(`❌ QR generation failed: ${err.message}`);
            }
        }
    ),
    aliases: ['qrcode', 'makeqr', 'genqr']
};
