// commands/aimenu.js — Dedicated AI command menu with 3 visual styles

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

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDur(ms) {
    const s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const parts = [];
    if (d) parts.push(`${d}d`);
    if (h) parts.push(`${h}h`);
    if (m) parts.push(`${m}m`);
    parts.push(`${sec}s`);
    return parts.join(' ');
}

function ramPct() {
    return Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100);
}

function ramBar(pct = ramPct(), len = 8) {
    const f = Math.round(pct / 100 * len);
    return '█'.repeat(f) + '░'.repeat(len - f);
}

// ─── AI command catalogue ────────────────────────────────────────────────────

const AI_CHAT = [
    { cmd: '.gpt',      aliases: '.ai  .chatgpt',   desc: 'GPT — OpenAI chat'          },
    { cmd: '.bard',     aliases: '.gemini',          desc: 'Bard / Gemini AI chat'      },
    { cmd: '.llama',    aliases: '.metaai',          desc: 'Meta LLaMA AI'              },
    { cmd: '.deepseek', aliases: '.ds',              desc: 'DeepSeek R1 assistant'      },
    { cmd: '.chat',     aliases: '',                 desc: 'AI chat with memory'        },
    { cmd: '.chatbot',  aliases: '',                 desc: 'Toggle auto-reply AI mode'  },
];

const AI_IMAGE = [
    { cmd: '.dalle',    aliases: '.imagine  .generate', desc: 'Text → image (DALL·E)'  },
    { cmd: '.aiimg',    aliases: '',                    desc: 'AI filter on replied img' },
    { cmd: '.enhance',  aliases: '',                    desc: 'Upscale / enhance image'  },
];

const AI_TIPS = [
    '💡 Tip: reply to any message when using .gpt to use it as context.',
    '💡 Tip: .chatbot on enables auto AI replies in your DMs.',
    '💡 Tip: .dalle supports natural language — be as descriptive as you like.',
    '💡 Tip: .chat keeps a conversation thread — use .chat reset to clear it.',
    '💡 Tip: .enhance works best on blurry or low-res photos.',
];

function randomTip() {
    return AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)];
}

// ─── Style renderers ─────────────────────────────────────────────────────────

function styleClassic(ctx) {
    const up = ctx.uptime ? fmtDur(ctx.uptime) : 'N/A';
    const pct = ramPct();

    let txt = `╔══════════════════════════════╗\n`;
    txt    += `║   🤖  BLU3BOT — AI MENU      ║\n`;
    txt    += `╚══════════════════════════════╝\n\n`;

    txt += `🧠 *TEXT & CHAT MODELS*\n`;
    txt += `${'─'.repeat(30)}\n`;
    for (const c of AI_CHAT) {
        txt += `  ◉ *${c.cmd}*`;
        if (c.aliases) txt += `  _(${c.aliases})_`;
        txt += `\n     ${c.desc}\n`;
    }

    txt += `\n🎨 *IMAGE GENERATION & EDITING*\n`;
    txt += `${'─'.repeat(30)}\n`;
    for (const c of AI_IMAGE) {
        txt += `  ◉ *${c.cmd}*`;
        if (c.aliases) txt += `  _(${c.aliases})_`;
        txt += `\n     ${c.desc}\n`;
    }

    txt += `\n${'─'.repeat(30)}\n`;
    txt += `⏱ Uptime: ${up}   💾 RAM: ${pct}%\n`;
    txt += `${randomTip()}`;
    return txt;
}

function styleFancy(ctx) {
    const up = ctx.uptime ? fmtDur(ctx.uptime) : 'N/A';
    const pct = ramPct();
    const bar = ramBar(pct);

    const line  = '━'.repeat(32);
    const dline = '═'.repeat(32);

    let txt = `╔${dline}╗\n`;
    txt    += `║  🤖  *B L U 3 B O T  —  A I*  ║\n`;
    txt    += `║         Smart Command Hub      ║\n`;
    txt    += `╚${dline}╝\n\n`;

    txt += `┌${line}┐\n`;
    txt += `│  🧠  *TEXT AI & CHAT MODELS*   │\n`;
    txt += `└${line}┘\n`;
    for (const c of AI_CHAT) {
        txt += `  ➤ *${c.cmd}* — ${c.desc}\n`;
        if (c.aliases) txt += `       aliases: _${c.aliases}_\n`;
    }

    txt += `\n┌${line}┐\n`;
    txt += `│  🎨  *IMAGE AI & ENHANCEMENT*  │\n`;
    txt += `└${line}┘\n`;
    for (const c of AI_IMAGE) {
        txt += `  ➤ *${c.cmd}* — ${c.desc}\n`;
        if (c.aliases) txt += `       aliases: _${c.aliases}_\n`;
    }

    txt += `\n┌${line}┐\n`;
    txt += `│ ⏱ ${up.padEnd(10)} │ RAM [${bar}] ${pct}% │\n`;
    txt += `└${line}┘\n`;
    txt += `\n${randomTip()}`;
    return txt;
}

function styleNeon(ctx) {
    const up = ctx.uptime ? fmtDur(ctx.uptime) : 'N/A';
    const pct = ramPct();
    const bar = ramBar(pct);

    let txt = `\`\`\`\n`;
    txt    += ` ██████╗ ██╗     ██╗   ██╗██████╗\n`;
    txt    += ` ██╔══██╗██║     ██║   ██║╚════██╗\n`;
    txt    += ` ██████╔╝██║     ██║   ██║  ▄███╔╝\n`;
    txt    += ` ██╔══██╗██║     ██║   ██║  ▀▀══╝\n`;
    txt    += ` ██████╔╝███████╗╚██████╔╝  ██╗\n`;
    txt    += ` ╚═════╝ ╚══════╝ ╚═════╝   ╚═╝  BOT\n`;
    txt    += `  ─────── A I   C O M M A N D S ───────\n`;
    txt    += `\`\`\`\n\n`;

    txt += `*[ 🧠 TEXT AI ]*\n`;
    for (const c of AI_CHAT) {
        const aliasStr = c.aliases ? ` | ${c.aliases}` : '';
        txt += `  ▸ *${c.cmd}*${aliasStr}\n`;
        txt += `    └ _${c.desc}_\n`;
    }

    txt += `\n*[ 🎨 IMAGE AI ]*\n`;
    for (const c of AI_IMAGE) {
        const aliasStr = c.aliases ? ` | ${c.aliases}` : '';
        txt += `  ▸ *${c.cmd}*${aliasStr}\n`;
        txt += `    └ _${c.desc}_\n`;
    }

    txt += `\n\`\`\``;
    txt += ` ⏱ ${up}  |  RAM [${bar}] ${pct}%`;
    txt += `\`\`\`\n`;
    txt += `\n${randomTip()}`;
    return txt;
}

// ─── Style help ───────────────────────────────────────────────────────────────

const STYLE_HELP =
    `🤖 *AI Menu Styles*\n\n` +
    `  *.aimenu 1* or *.aimenu classic*\n` +
    `  *.aimenu 2* or *.aimenu fancy*\n` +
    `  *.aimenu 3* or *.aimenu neon*\n\n` +
    `Default (no argument) shows the classic style.\n` +
    `Example: \`.aimenu 2\``;

// ─── Command ─────────────────────────────────────────────────────────────────

module.exports = {
    command: new Command(
        'aimenu',
        'Show the dedicated AI commands menu',
        '.aimenu [1-3 | classic | fancy | neon | styles]',
        'ai',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🤖');

            const arg = (args[0] || '').toLowerCase();

            if (arg === 'styles' || arg === 'help') {
                await reply(STYLE_HELP);
                return;
            }

            if (!global.BOT_START_TIME) global.BOT_START_TIME = Date.now();
            const ctx = { uptime: Date.now() - global.BOT_START_TIME };

            let style = 1; // default

            if (arg === '2' || arg === 'fancy')   style = 2;
            else if (arg === '3' || arg === 'neon') style = 3;
            else if (arg === '1' || arg === 'classic') style = 1;

            let text;
            if      (style === 2) text = styleFancy(ctx);
            else if (style === 3) text = styleNeon(ctx);
            else                  text = styleClassic(ctx);

            // Send with menu image if one is set, otherwise plain text
            if (global.menuImage) {
                try {
                    await Blu3Bot.sendMessage(from, {
                        image: global.menuImage,
                        caption: text
                    }, { quoted: message });
                    return;
                } catch {
                    // fall through to plain text
                }
            }

            await reply(text);
        }
    ),
    aliases: ['ai menu', 'aicmds', 'aicommands', 'aihelp']
};
