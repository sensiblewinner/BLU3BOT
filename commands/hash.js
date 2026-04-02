// commands/hash.js — Multi-algorithm string hasher
const crypto = require('crypto');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const ALGOS = ['md5', 'sha1', 'sha256', 'sha512'];

module.exports = {
    command: new Command(
        'hash',
        'Generate cryptographic hashes of any text (MD5, SHA1, SHA256, SHA512)',
        '.hash [text] — or .hash [algo] [text]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔑');

            if (!args[0]) {
                await reply(
                    '🔑 *Hash Generator*\n\n' +
                    'Usage:\n' +
                    '• `.hash Hello World` — all algorithms\n' +
                    '• `.hash sha256 Hello World` — specific algorithm\n\n' +
                    'Algorithms: `md5` `sha1` `sha256` `sha512`'
                );
                return;
            }

            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const quotedText =
                quoted?.quotedMessage?.conversation ||
                quoted?.quotedMessage?.extendedTextMessage?.text || null;

            let text, single = null;

            const firstArgLower = args[0].toLowerCase();
            if (ALGOS.includes(firstArgLower)) {
                single = firstArgLower;
                text = args.slice(1).join(' ').trim() || quotedText;
            } else {
                text = args.join(' ').trim() || quotedText;
            }

            if (!text) {
                await reply('⚠️ Provide text to hash.\n`.hash Hello World`');
                return;
            }

            if (single) {
                const h = crypto.createHash(single).update(text).digest('hex');
                await reply(
                    `🔑 *${single.toUpperCase()} Hash*\n\n` +
                    `📥 Input : \`${text.substring(0, 60)}${text.length > 60 ? '...' : ''}\`\n\n` +
                    `\`${h}\``
                );
                return;
            }

            const results = ALGOS.map(algo => {
                const h = crypto.createHash(algo).update(text).digest('hex');
                return `*${algo.toUpperCase()}*\n\`${h}\``;
            });

            await reply(
                `🔑 *Hash Generator*\n\n` +
                `📥 Input: \`${text.substring(0, 60)}${text.length > 60 ? '...' : ''}\`\n\n` +
                results.join('\n\n')
            );
        }
    ),
    aliases: ['md5', 'sha256', 'checksum', 'digest']
};
