// commands/settheme.js — Set global bot color theme + default menu style
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.botTheme) global.botTheme = 'classic';

const THEMES = {
    classic: {
        label:   'Classic',
        emoji:   '🔵',
        preview: '╔══════════╗\n║ BLU3BOT  ║\n╚══════════╝',
        desc:    'Clean borders, plain sections'
    },
    neon: {
        label:   'Neon',
        emoji:   '💜',
        preview: '▓▒░ BLU3BOT ░▒▓\n ⚡ NEON MODE ⚡',
        desc:    'Cyberpunk glitch aesthetic'
    },
    minimal: {
        label:   'Minimal',
        emoji:   '⚪',
        preview: '── BLU3BOT ──\n  Commands',
        desc:    'No borders, pure content'
    },
    fancy: {
        label:   'Fancy',
        emoji:   '🌟',
        preview: '┌──────────────┐\n│  ✦ BLU3BOT ✦  │\n└──────────────┘',
        desc:    'Rounded luxury borders'
    },
    modern: {
        label:   'Modern',
        emoji:   '🟣',
        preview: '◈ BLU3BOT\n━━━━━━━━━━━\n  Commands',
        desc:    'Bold sections with dividers'
    },
};

// Menu style number mapping
const THEME_TO_MENU = { classic: 1, minimal: 2, fancy: 3, modern: 4, neon: 5 };

module.exports = {
    command: new Command(
        'settheme',
        'Set the global bot display theme — affects all menus',
        '.settheme [classic | neon | minimal | fancy | modern]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎨');

            const input = args[0]?.toLowerCase();
            const current = global.botTheme || 'classic';

            if (!input || input === 'list' || input === 'help') {
                const list = Object.entries(THEMES)
                    .map(([key, t]) => `  ${key === current ? '✅' : '  '} ${t.emoji} *${t.label}* — _${t.desc}_`)
                    .join('\n');
                await reply(
                    `🎨 *Bot Theme Selector*\n\n` +
                    `Current: *${THEMES[current]?.emoji} ${THEMES[current]?.label}*\n\n` +
                    `${list}\n\n` +
                    `Usage: \`.settheme neon\``
                );
                return;
            }

            const theme = THEMES[input];
            if (!theme) {
                await reply(`❌ Unknown theme \`${input}\`\n\nAvailable: ${Object.keys(THEMES).join(', ')}`);
                return;
            }

            global.botTheme = input;
            global.defaultMenuStyle = THEME_TO_MENU[input] || 1;

            await reply(
                `🎨 *Theme Changed*\n\n` +
                `${theme.emoji} *${theme.label}*\n\n` +
                `\`\`\`\n${theme.preview}\n\`\`\`\n\n` +
                `_${theme.desc}_\n\n` +
                `✅ All menus will now use this style.\nUse \`.menu\` to see it live.`
            );
        }
    ),
    ownerOnly: true,
    aliases: ['theme', 'bottheme', 'menutheme']
};
