// commands/translate.js — Free translation via MyMemory API
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

// Common language aliases
const LANG_MAP = {
    english: 'en', en: 'en',
    french:  'fr', fr: 'fr',
    spanish: 'es', es: 'es',
    swahili: 'sw', sw: 'sw',
    arabic:  'ar', ar: 'ar',
    german:  'de', de: 'de',
    portuguese: 'pt', pt: 'pt',
    russian: 'ru', ru: 'ru',
    chinese: 'zh', zh: 'zh',
    japanese:'ja', ja: 'ja',
    korean:  'ko', ko: 'ko',
    italian: 'it', it: 'it',
    dutch:   'nl', nl: 'nl',
    turkish: 'tr', tr: 'tr',
    hindi:   'hi', hi: 'hi',
    amharic: 'am', am: 'am',
    somali:  'so', so: 'so',
    hausa:   'ha', ha: 'ha',
    yoruba:  'yo', yo: 'yo',
    igbo:    'ig', ig: 'ig',
};

module.exports = {
    command: new Command(
        'translate',
        'Translate text to any language',
        '.translate [language] [text] — or reply to a message',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🌐');

            if (!args[0]) {
                await reply(
                    '🌐 *Translate*\n\n' +
                    'Usage:\n' +
                    '`.translate french Hello world`\n' +
                    '`.translate sw` _(reply to a message)_\n\n' +
                    'Supported: english, french, spanish, swahili, arabic, german,\n' +
                    'portuguese, russian, chinese, japanese, korean, italian, hindi,\n' +
                    'hausa, yoruba, igbo, and many more.'
                );
                return;
            }

            const rawLang = args[0].toLowerCase();
            const targetCode = LANG_MAP[rawLang] || rawLang; // fallback: use directly as code

            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const quotedText =
                quoted?.quotedMessage?.conversation ||
                quoted?.quotedMessage?.extendedTextMessage?.text || null;

            const inlineText = args.slice(1).join(' ').trim();
            const textToTranslate = inlineText || quotedText;

            if (!textToTranslate) {
                await reply('⚠️ Please provide text to translate, or reply to a message.\n`.translate french Hello`');
                return;
            }

            try {
                const res = await axios.get('https://api.mymemory.translated.net/get', {
                    params: {
                        q: textToTranslate,
                        langpair: `auto|${targetCode}`
                    },
                    timeout: 10000
                });

                const data = res.data;
                if (!data || data.responseStatus !== 200) {
                    throw new Error('Translation API returned error');
                }

                const translated = data.responseData.translatedText;
                const detectedLang = data.responseData?.detectedLanguage || 'auto';
                const matchValue = Math.round((data.responseData.match || 0) * 100);

                await reply(
                    `🌐 *Translation*\n\n` +
                    `📥 *From:* ${detectedLang}\n` +
                    `📤 *To:* ${targetCode.toUpperCase()}\n\n` +
                    `${translated}\n\n` +
                    `_Confidence: ${matchValue}%_`
                );

            } catch (err) {
                await reply(`❌ Translation failed: ${err.message}`);
            }
        }
    ),
    aliases: ['tr', 'trans', 'tl']
};
