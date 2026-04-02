// commands/mock.js — SpOnGeBoB mocking text + more text transformations
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

function spongebob(text) {
    return text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
}

function vaporwave(text) {
    return text.split('').map(c => {
        const code = c.charCodeAt(0);
        if (code >= 33 && code <= 126) return String.fromCharCode(code + 0xFEE0);
        if (c === ' ') return '  ';
        return c;
    }).join('');
}

function clap(text) {
    return text.trim().split(/\s+/).join(' 👏 ') + ' 👏';
}

function reverse(text) {
    return text.split('').reverse().join('');
}

function zalgo(text) {
    const up = ['̍','̎','̄','̅','̿','̑','̆','̐','͒','͗','͑','̇','̈','̊','͂','̓','̈','͊','͋','͌','̃','̂','̌'];
    const down = ['̖','̗','̘','̙','̜','̝','̞','̟','̠','̤','̥','̦','̩','̪','̫','̬','̭','̮','̯','̰','̱','̲','̳'];
    return text.split('').map(c => {
        if (c === ' ') return c;
        let out = c;
        const u = Math.floor(Math.random() * 3) + 1;
        const d = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < u; i++) out += up[Math.floor(Math.random() * up.length)];
        for (let i = 0; i < d; i++) out += down[Math.floor(Math.random() * down.length)];
        return out;
    }).join('');
}

const MODES = {
    spongebob: { fn: spongebob,  label: 'SpOnGeBoB Mock'  },
    vaporwave:  { fn: vaporwave, label: 'Ｖａｐｏｒｗａｖｅ' },
    clap:       { fn: clap,      label: 'Clap 👏'          },
    reverse:    { fn: reverse,   label: 'Reversed'         },
    zalgo:      { fn: zalgo,     label: 'Z̷a̷l̷g̷o̷'          },
    upper:      { fn: t => t.toUpperCase(), label: 'UPPERCASE'  },
    lower:      { fn: t => t.toLowerCase(), label: 'lowercase'  },
};

module.exports = {
    command: new Command(
        'mock',
        'Transform text — SpOnGeBoB mock, vaporwave, clap, zalgo, reverse and more',
        '.mock [mode] [text] — modes: spongebob, vaporwave, clap, reverse, zalgo, upper, lower',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('😂');

            const quoted = message.message?.extendedTextMessage?.contextInfo;
            const quotedText =
                quoted?.quotedMessage?.conversation ||
                quoted?.quotedMessage?.extendedTextMessage?.text || null;

            if (!args[0]) {
                await reply(
                    '😂 *Text Transformer*\n\n' +
                    'Usage: `.mock [mode] [text]`\n\n' +
                    'Modes:\n' +
                    '• `spongebob` — sPoNgEbOb mOcK\n' +
                    '• `vaporwave` — Ｆｕｌｌｗｉｄｔｈ\n' +
                    '• `clap`      — 👏between👏words👏\n' +
                    '• `reverse`   — txet desreveR\n' +
                    '• `zalgo`     — Z̷ą̸l̴g̷ò̴ text\n' +
                    '• `upper`     — UPPERCASE\n' +
                    '• `lower`     — lowercase\n\n' +
                    'Tip: reply to a message and use just `.mock spongebob`'
                );
                return;
            }

            const modeKey = args[0].toLowerCase();
            const mode = MODES[modeKey];
            const text = args.slice(1).join(' ').trim() || quotedText;

            if (!mode) {
                // No mode given — default to spongebob
                const allText = args.join(' ').trim() || quotedText;
                if (!allText) { await reply('Provide some text! `.mock [text]`'); return; }
                await reply(`🧽 *SpOnGeBoB MoCk*\n\n${spongebob(allText)}`);
                return;
            }

            if (!text) {
                await reply(`⚠️ Provide text or reply to a message.\n\`.mock ${modeKey} Hello world\``);
                return;
            }

            const result = mode.fn(text);
            await reply(`${mode.label}\n\n${result}`);
        }
    ),
    aliases: ['spongebob', 'vaporwave', 'clap', 'zalgo', 'textfx']
};
