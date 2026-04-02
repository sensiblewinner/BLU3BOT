// commands/countdown.js — Countdown to a date/event
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

function parseDateInput(input) {
    // Handle relative: "Christmas", "New Year", "my birthday on Dec 25"
    const lc = input.toLowerCase();

    const presets = {
        'new year':   () => { const d = new Date(); d.setFullYear(d.getFullYear() + (d.getMonth() >= 11 && d.getDate() >= 31 ? 1 : 0), 0, 1); d.setHours(0,0,0,0); return d; },
        'christmas':  () => { const d = new Date(); d.setFullYear(d.getMonth() > 11 || (d.getMonth() === 11 && d.getDate() >= 25) ? d.getFullYear() + 1 : d.getFullYear(), 11, 25); d.setHours(0,0,0,0); return d; },
        'halloween':  () => { const d = new Date(); d.setFullYear(d.getMonth() > 9 || (d.getMonth() === 9 && d.getDate() >= 31) ? d.getFullYear() + 1 : d.getFullYear(), 9, 31); d.setHours(0,0,0,0); return d; },
        'valentines': () => { const d = new Date(); d.setFullYear(d.getMonth() > 1 || (d.getMonth() === 1 && d.getDate() >= 14) ? d.getFullYear() + 1 : d.getFullYear(), 1, 14); d.setHours(0,0,0,0); return d; },
    };

    for (const [key, fn] of Object.entries(presets)) {
        if (lc.includes(key)) return { date: fn(), label: input };
    }

    // Try direct parse
    const d = new Date(input);
    if (!isNaN(d.getTime())) return { date: d, label: input };

    return null;
}

function formatDiff(ms) {
    if (ms <= 0) return null;
    const s   = Math.floor(ms / 1000);
    const d   = Math.floor(s / 86400);
    const h   = Math.floor((s % 86400) / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const weeks  = Math.floor(d / 7);
    const days   = d % 7;
    const months = Math.floor(d / 30);
    return { d, h, m, sec, weeks, days, months };
}

module.exports = {
    command: new Command(
        'countdown',
        'Count down the time remaining until any event or date',
        '.countdown [date or event name]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('⏳');

            if (!args[0]) {
                await reply(
                    '⏳ *Countdown*\n\n' +
                    'Examples:\n' +
                    '• `.countdown Christmas`\n' +
                    '• `.countdown New Year`\n' +
                    '• `.countdown 2025-12-31`\n' +
                    '• `.countdown December 25 2025`\n' +
                    '• `.countdown Halloween`\n' +
                    '• `.countdown Valentines`'
                );
                return;
            }

            const input = args.join(' ').trim();
            const parsed = parseDateInput(input);

            if (!parsed) {
                await reply(`❌ Couldn't understand that date. Try:\n• \`.countdown Christmas\`\n• \`.countdown 2025-12-31\`\n• \`.countdown December 25 2025\``);
                return;
            }

            const now  = Date.now();
            const diff = parsed.date.getTime() - now;

            if (diff <= 0) {
                await reply(`⏰ *${parsed.label}* has already passed!`);
                return;
            }

            const t = formatDiff(diff);
            const dateStr = parsed.date.toDateString();

            const bar_total = 365;
            const bar_done  = Math.min(bar_total, bar_total - Math.ceil(t.d));
            const pct       = Math.max(0, Math.min(100, Math.round(bar_done / bar_total * 100)));
            const filled    = Math.round(pct / 10);
            const bar       = '█'.repeat(filled) + '░'.repeat(10 - filled);

            await reply(
                `⏳ *Countdown to ${input}*\n\n` +
                `📅 Date     : ${dateStr}\n\n` +
                `📆 *${t.d} days* ${t.h}h ${t.m}m ${t.sec}s\n\n` +
                `  = ${t.months > 0 ? `~${t.months} months` : ''} ${t.weeks > 0 ? `${t.weeks} weeks` : ''} ${t.days > 0 ? `${t.days} days` : ''}\n\n` +
                `Progress  [${bar}] ${pct}%\n` +
                `_Updated: ${new Date().toLocaleTimeString()}_`
            );
        }
    ),
    aliases: ['timer', 'daysuntil', 'until']
};
