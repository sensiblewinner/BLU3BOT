// commands/setlang.js — Set bot default response language
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.botLanguage) global.botLanguage = 'en';

const LANGUAGES = {
    en:  { label: 'English',    native: 'English',     flag: '🇬🇧' },
    sw:  { label: 'Swahili',    native: 'Kiswahili',   flag: '🇰🇪' },
    fr:  { label: 'French',     native: 'Français',    flag: '🇫🇷' },
    es:  { label: 'Spanish',    native: 'Español',     flag: '🇪🇸' },
    ar:  { label: 'Arabic',     native: 'العربية',     flag: '🇸🇦' },
    pt:  { label: 'Portuguese', native: 'Português',   flag: '🇧🇷' },
    hi:  { label: 'Hindi',      native: 'हिन्दी',       flag: '🇮🇳' },
    ha:  { label: 'Hausa',      native: 'Hausa',       flag: '🇳🇬' },
    yo:  { label: 'Yoruba',     native: 'Yorùbá',      flag: '🇳🇬' },
    ig:  { label: 'Igbo',       native: 'Igbo',        flag: '🇳🇬' },
    am:  { label: 'Amharic',    native: 'አማርኛ',        flag: '🇪🇹' },
    zh:  { label: 'Chinese',    native: '中文',          flag: '🇨🇳' },
    ja:  { label: 'Japanese',   native: '日本語',         flag: '🇯🇵' },
};

// System messages in each language
const STRINGS = {
    maintenance: {
        en: '🔧 Bot is under maintenance. Try again later.',
        sw: '🔧 Bot iko katika matengenezo. Jaribu tena baadaye.',
        fr: '🔧 Le bot est en maintenance. Réessayez plus tard.',
        es: '🔧 El bot está en mantenimiento. Inténtalo más tarde.',
        ar: '🔧 البوت في وضع الصيانة. حاول مرة أخرى لاحقاً.',
        pt: '🔧 O bot está em manutenção. Tente novamente mais tarde.',
        hi: '🔧 बॉट रखरखाव में है। बाद में पुनः प्रयास करें।',
    },
    cooldown: {
        en: '⏱️ Please wait {sec}s before using another command.',
        sw: '⏱️ Tafadhali subiri sekunde {sec} kabla ya kutumia amri nyingine.',
        fr: '⏱️ Veuillez attendre {sec}s avant d\'utiliser une autre commande.',
        es: '⏱️ Por favor espera {sec}s antes de usar otro comando.',
    }
};

module.exports = {
    command: new Command(
        'setlang',
        'Set the default language for bot system messages',
        '.setlang [language code or name]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🌐');

            const input = args[0]?.toLowerCase();
            const currentLang = LANGUAGES[global.botLanguage] || LANGUAGES['en'];

            if (!input || input === 'list') {
                const list = Object.entries(LANGUAGES)
                    .map(([code, l]) =>
                        `  ${code === global.botLanguage ? '✅' : '  '} ${l.flag} \`${code}\` — ${l.label} _(${l.native})_`
                    )
                    .join('\n');

                await reply(
                    `🌐 *Bot Language*\n\n` +
                    `Current: ${currentLang.flag} *${currentLang.label}*\n\n` +
                    `${list}\n\n` +
                    `Usage: \`.setlang sw\``
                );
                return;
            }

            // Also accept full names
            const codeByName = Object.entries(LANGUAGES).find(
                ([, l]) => l.label.toLowerCase() === input || l.native.toLowerCase() === input
            );
            const code = LANGUAGES[input] ? input : codeByName?.[0];

            if (!code) {
                await reply(`❌ Language not found.\n\nRun \`.setlang list\` to see all supported languages.`);
                return;
            }

            const lang = LANGUAGES[code];
            global.botLanguage = code;

            // Export the strings globally so other commands can reference them
            global.botStrings = STRINGS;

            await react('✅');
            await reply(
                `${lang.flag} *Language Updated*\n\n` +
                `Now: *${lang.label}* (${lang.native})\n\n` +
                `_System messages like maintenance notices and cooldown\n` +
                `warnings will now be sent in ${lang.label}._`
            );
        }
    ),
    ownerOnly: true,
    aliases: ['language', 'lang', 'botlang', 'changelang']
};
