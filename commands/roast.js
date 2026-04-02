// commands/roast.js — AI-generated roast
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

const AI_APIS = [
    'https://api.erdwpe.com/api/ai/gpt',
    'https://api.gurusensei.workers.dev/llama',
    'https://api.privatezia.biz.id/api/ai/GPT-4'
];

async function askAI(prompt) {
    for (const url of AI_APIS) {
        try {
            const res = await axios.get(`${url}?query=${encodeURIComponent(prompt)}`, { timeout: 15000 });
            const text = res.data?.result || res.data?.message || res.data?.response || res.data?.text;
            if (text && text.trim().length > 5) return text.trim();
        } catch {}
    }
    throw new Error('All AI endpoints failed');
}

module.exports = {
    command: new Command(
        'roast',
        'Get an AI-generated roast for yourself, a replied message, or a @mention',
        '.roast [@mention or reply]',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔥');

            const quoted  = message.message?.extendedTextMessage?.contextInfo;
            const quotedText = quoted?.quotedMessage?.conversation
                || quoted?.quotedMessage?.extendedTextMessage?.text
                || null;
            const quotedPusher = quoted?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const extraText = args.join(' ').trim();

            let target, targetLabel;

            if (quotedText) {
                targetLabel = `someone who said: "${quotedText}"`;
                target = quotedPusher ? `+${quotedPusher.split('@')[0]}` : 'them';
            } else if (mentioned) {
                target = `+${mentioned.split('@')[0]}`;
                targetLabel = `a person named ${target}`;
            } else if (extraText) {
                targetLabel = extraText;
                target = extraText;
            } else {
                targetLabel = 'the person who just sent a message with no context whatsoever';
                target = 'them';
            }

            const prompt =
                `You are a savage but funny roast comedian on WhatsApp. ` +
                `Give a short, brutal, witty roast (2-4 sentences) for ${targetLabel}. ` +
                `Keep it funny and playful, not genuinely offensive or hateful. ` +
                `Don't start with "Sure" or explain yourself — just roast them directly.`;

            try {
                const roast = await askAI(prompt);
                await reply(`🔥 *Roast incoming...*\n\n${roast}\n\n_— BLU3BOT Roast Engine 🤖_`);
            } catch (err) {
                await reply('❌ The roast engine is offline. You got lucky this time.');
            }
        }
    ),
    aliases: ['burn', 'clown']
};
