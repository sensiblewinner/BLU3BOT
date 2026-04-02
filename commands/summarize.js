// commands/summarize.js — AI text summarizer
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
            const res = await axios.get(`${url}?query=${encodeURIComponent(prompt)}`, { timeout: 20000 });
            const text = res.data?.result || res.data?.message || res.data?.response || res.data?.text;
            if (text && text.trim().length > 5) return text.trim();
        } catch {}
    }
    throw new Error('All AI endpoints failed');
}

module.exports = {
    command: new Command(
        'summarize',
        'AI-powered summary of a replied message or provided text',
        '.summarize [or reply to a long message]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📝');

            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const quotedText =
                quoted?.quotedMessage?.conversation ||
                quoted?.quotedMessage?.extendedTextMessage?.text || null;

            const inlineText = args.join(' ').trim();
            const textToSummarize = quotedText || inlineText;

            if (!textToSummarize || textToSummarize.length < 30) {
                await reply(
                    '📝 *Summarize*\n\n' +
                    'Reply to a long message or provide text:\n' +
                    '`.summarize [text]`\n\n' +
                    '_Minimum 30 characters required._'
                );
                return;
            }

            if (textToSummarize.length > 4000) {
                await reply('⚠️ Text too long (max 4000 characters). Please trim it a bit.');
                return;
            }

            const prompt =
                `Summarize the following text concisely in clear bullet points. ` +
                `Keep it short, accurate and easy to understand. ` +
                `Format as: key point 1, key point 2, etc.\n\nText:\n${textToSummarize}`;

            try {
                const summary = await askAI(prompt);
                await reply(
                    `📝 *Summary*\n\n` +
                    `${summary}\n\n` +
                    `_Original: ${textToSummarize.length} chars → summarized_`
                );
            } catch {
                await reply('❌ AI summarizer is unavailable right now. Try again later.');
            }
        }
    ),
    aliases: ['tldr', 'sum', 'tl;dr']
};
