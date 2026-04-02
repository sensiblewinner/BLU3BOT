// commands/menu.js — Multi-style menu with 5 themes

const os = require('os');

class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

// ─── Category metadata ─────────────────────────────────────────────────────
const CATEGORY_META = {
    download:  { icon: '⬇️',  label: 'DOWNLOAD'  },
    music:     { icon: '🎵',  label: 'MUSIC'     },
    ai:        { icon: '🤖',  label: 'AI'        },
    search:    { icon: '🔍',  label: 'SEARCH'    },
    media:     { icon: '🖼️',  label: 'MEDIA'     },
    tools:     { icon: '🔧',  label: 'TOOLS'     },
    general:   { icon: '💬',  label: 'GENERAL'   },
    fun:       { icon: '🎉',  label: 'FUN'       },
    utility:   { icon: '⚙️',  label: 'UTILITY'   },
    owner:     { icon: '👑',  label: 'OWNER'     },
    group:     { icon: '👥',  label: 'GROUP'     },
    settings:  { icon: '🛠️',  label: 'SETTINGS'  },
};

const CATEGORY_ORDER = [
    'download','music','ai','search','media','tools',
    'general','fun','utility','owner','group','settings'
];

function sortedCategories(categories) {
    const result = [];
    for (const key of CATEGORY_ORDER) {
        if (categories[key]?.length) result.push([key, categories[key]]);
    }
    // Any uncategorised ones
    for (const [key, cmds] of Object.entries(categories)) {
        if (!CATEGORY_ORDER.includes(key) && cmds?.length) result.push([key, cmds]);
    }
    return result;
}

function sortedCmds(cmds) {
    return [...cmds].sort((a, b) => a.name.localeCompare(b.name));
}

function ramBar(pct, len = 10) {
    const filled = Math.round(pct / 100 * len);
    return '█'.repeat(filled) + '░'.repeat(len - filled);
}

function sysStats() {
    const memUsed = Math.round((os.totalmem() - os.freemem()) / 1024 / 1024);
    const memTotal = Math.round(os.totalmem() / 1024 / 1024);
    const pct = Math.round(memUsed / memTotal * 100);
    return { memUsed, memTotal, pct };
}

// ──────────────────────────────────────────────────────────────────────────────
// STYLE 1 — Classic Box  (default)
// ──────────────────────────────────────────────────────────────────────────────
function style1(commands, categories, config) {
    const { memUsed, memTotal, pct } = sysStats();
    const prefix = config?.PREFIX || '.';
    const mode   = config?.MODE || 'Public';
    const ver    = config?.BOT_VERSION || '2.0.0';
    const W = 34;
    const line = '+' + '─'.repeat(W) + '+';
    const pad  = (s) => `| ${s.padEnd(W - 2)} |`;

    let t = `${line}\n`;
    t += pad('      🧩  B L U 3 B O T  M E N U      ') + '\n';
    t += `${line}\n`;
    t += pad(`👤 Owner   : Brandon`) + '\n';
    t += pad(`🔧 Prefix  : [ ${prefix} ]`) + '\n';
    t += pad(`📦 Commands: ${commands.length}`) + '\n';
    t += pad(`🌐 Mode    : ${mode}`) + '\n';
    t += pad(`🧬 Version : ${ver}`) + '\n';
    t += pad(`💾 RAM     : ${memUsed}/${memTotal} MB`) + '\n';
    t += pad(`🟩 Load    : [${ramBar(pct)}] ${pct}%`) + '\n';
    t += `${line}\n\n`;

    for (const [key, cmds] of sortedCategories(categories)) {
        const meta = CATEGORY_META[key] || { icon: '📂', label: key.toUpperCase() };
        t += `${line}\n`;
        t += `| ${(meta.icon + '  ' + meta.label).padEnd(W - 2)} |\n`;
        t += `${line}\n`;
        for (const cmd of sortedCmds(cmds)) {
            t += `| › .${cmd.name.padEnd(W - 5)} |\n`;
        }
        t += `${line}\n\n`;
    }
    return t;
}

// ──────────────────────────────────────────────────────────────────────────────
// STYLE 2 — Minimal / Clean
// ──────────────────────────────────────────────────────────────────────────────
function style2(commands, categories, config) {
    const prefix = config?.PREFIX || '.';
    const mode   = config?.MODE || 'Public';

    let t = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    t += `  🤖  *BLU3BOT*  •  v${config?.BOT_VERSION || '2.0.0'}\n`;
    t += `  Prefix: ${prefix}  •  ${mode}  •  ${commands.length} cmds\n`;
    t += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    for (const [key, cmds] of sortedCategories(categories)) {
        const meta = CATEGORY_META[key] || { icon: '📂', label: key.toUpperCase() };
        t += `${meta.icon} *${meta.label}*\n`;
        const names = sortedCmds(cmds).map(c => `\`${prefix}${c.name}\``).join('  ');
        t += `${names}\n\n`;
    }

    t += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    t += `_Type ${prefix}help [cmd] for details_`;
    return t;
}

// ──────────────────────────────────────────────────────────────────────────────
// STYLE 3 — Fancy Emoji Tiles
// ──────────────────────────────────────────────────────────────────────────────
function style3(commands, categories, config) {
    const prefix = config?.PREFIX || '.';
    const { memUsed, memTotal, pct } = sysStats();

    let t = `╔══════════════════════════════╗\n`;
    t += `║  ✨  *BLU3BOT*  •  ${config?.BOT_VERSION || '2.0.0'}  ✨  ║\n`;
    t += `╚══════════════════════════════╝\n`;
    t += `👤 Owner  » Brandon\n`;
    t += `🔑 Prefix » ${prefix}\n`;
    t += `📦 Cmds   » ${commands.length}\n`;
    t += `💾 RAM    » ${memUsed}/${memTotal} MB (${pct}%)\n\n`;

    for (const [key, cmds] of sortedCategories(categories)) {
        const meta = CATEGORY_META[key] || { icon: '📂', label: key.toUpperCase() };
        t += `┌─ ${meta.icon} *${meta.label}* ${'─'.repeat(Math.max(0, 22 - meta.label.length))}┐\n`;
        for (const cmd of sortedCmds(cmds)) {
            t += `│  ◈ ${prefix}${cmd.name}\n`;
        }
        t += `└${'─'.repeat(28)}┘\n\n`;
    }
    return t;
}

// ──────────────────────────────────────────────────────────────────────────────
// STYLE 4 — WhatsApp Bold Headers (stars/underlines)
// ──────────────────────────────────────────────────────────────────────────────
function style4(commands, categories, config) {
    const prefix = config?.PREFIX || '.';
    const mode   = config?.MODE || 'Public';

    let t = `*━━━━━ BLU3BOT MENU ━━━━━*\n\n`;
    t += `*👤 Owner:* Brandon\n`;
    t += `*🔧 Prefix:* ${prefix}\n`;
    t += `*📦 Commands:* ${commands.length}\n`;
    t += `*🌐 Mode:* ${mode}\n`;
    t += `*🧬 Version:* ${config?.BOT_VERSION || '2.0.0'}\n\n`;

    for (const [key, cmds] of sortedCategories(categories)) {
        const meta = CATEGORY_META[key] || { icon: '📂', label: key.toUpperCase() };
        t += `*${meta.icon} ${meta.label}*\n`;
        t += `${'▔'.repeat(22)}\n`;
        let row = '';
        for (const cmd of sortedCmds(cmds)) {
            const entry = `${prefix}${cmd.name}  `;
            if (row.length + entry.length > 32) {
                t += row.trimEnd() + '\n';
                row = '';
            }
            row += entry;
        }
        if (row.trim()) t += row.trimEnd() + '\n';
        t += '\n';
    }

    t += `*━━━━━━━━━━━━━━━━━━━━━━━━━━━*`;
    return t;
}

// ──────────────────────────────────────────────────────────────────────────────
// STYLE 5 — Neon/Hacker (monospace-friendly)
// ──────────────────────────────────────────────────────────────────────────────
function style5(commands, categories, config) {
    const prefix = config?.PREFIX || '.';
    const { memUsed, memTotal, pct } = sysStats();

    let t = `\`\`\`\n`;
    t += ` ██████╗ ██╗     ██╗   ██╗██████╗\n`;
    t += ` ██╔══██╗██║     ██║   ██║╚════██╗\n`;
    t += ` ██████╔╝██║     ██║   ██║ █████╔╝\n`;
    t += ` ██╔══██╗██║     ██║   ██║ ╚═══██╗\n`;
    t += ` ██████╔╝███████╗╚██████╔╝██████╔╝\n`;
    t += ` ╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝\n`;
    t += `  ════════ B O T ════════\n\n`;
    t += ` PREFIX  : ${prefix}\n`;
    t += ` COMMANDS: ${commands.length}\n`;
    t += ` RAM     : ${memUsed}/${memTotal}MB [${ramBar(pct)}]\n`;
    t += `\`\`\`\n\n`;

    for (const [key, cmds] of sortedCategories(categories)) {
        const meta = CATEGORY_META[key] || { icon: '▸', label: key.toUpperCase() };
        t += `${meta.icon} *${meta.label}*\n`;
        t += sortedCmds(cmds).map(c => `  \`${prefix}${c.name}\``).join('\n') + '\n\n';
    }
    return t;
}

// ──────────────────────────────────────────────────────────────────────────────
// Dispatch
// ──────────────────────────────────────────────────────────────────────────────
const STYLES = {
    '1': style1, 'classic': style1, 'box': style1, 'default': style1,
    '2': style2, 'minimal': style2, 'clean': style2, 'simple': style2,
    '3': style3, 'fancy': style3, 'tiles': style3,
    '4': style4, 'bold': style4, 'modern': style4,
    '5': style5, 'neon': style5, 'hacker': style5, 'code': style5,
};

const STYLE_HELP = `📋 *Menu Styles*

Type \`.menu [style]\` to change style:

*1* ─ Classic Box  _(default)_
*2* ─ Minimal / Clean
*3* ─ Fancy Emoji Tiles
*4* ─ Modern Bold
*5* ─ Neon / Hacker

You can also use names:
\`.menu classic\` · \`.menu minimal\` · \`.menu fancy\` · \`.menu modern\` · \`.menu neon\``;

module.exports = {
    command: new Command(
        'menu',
        'Show command menu (5 styles available)',
        '.menu [1-5 | style name]',
        'general',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📋');

            if (!global.commandHandler) {
                await reply('❌ Command handler not initialised.');
                return;
            }

            const styleKey = (args[0] || '1').toLowerCase();

            // Show help if they ask
            if (styleKey === 'help' || styleKey === 'styles') {
                await reply(STYLE_HELP);
                return;
            }

            const styleFn = STYLES[styleKey];
            if (!styleFn) {
                await reply(`❌ Unknown style "${args[0]}"\n\n${STYLE_HELP}`);
                return;
            }

            const commands   = global.commandHandler.getAllCommands?.() || [];
            const categories = global.commandHandler.getCommandsByCategory?.() || {};
            const config     = context?.config || {};

            let menuText;
            try {
                menuText = styleFn(commands, categories, config);
            } catch (err) {
                console.error('Menu render error:', err.message);
                // Fallback: flat command list
                const allCmds = Array.from(global.commandHandler.commands.keys()).sort();
                menuText = `*BLU3BOT — ${allCmds.length} Commands*\n\n` + allCmds.map(c => `• ${config?.PREFIX || '.'}${c}`).join('\n');
            }

            try {
                await Blu3Bot.sendMessage(
                    from,
                    {
                        image: { url: 'https://i.ibb.co/0phhSQc9/BLU3BOT.jpg' },
                        caption: menuText
                    },
                    { quoted: message }
                );
            } catch {
                // Image failed — text only
                await reply(menuText);
            }
        }
    )
};
