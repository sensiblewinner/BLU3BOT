// commands/password.js — Secure password generator
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

const SETS = {
    upper:  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower:  'abcdefghijklmnopqrstuvwxyz',
    digits: '0123456789',
    symbol: '!@#$%^&*()_+-=[]{}|;:,.?'
};

function generate(length, opts) {
    let pool = '';
    if (opts.upper)  pool += SETS.upper;
    if (opts.lower)  pool += SETS.lower;
    if (opts.digits) pool += SETS.digits;
    if (opts.symbol) pool += SETS.symbol;
    if (!pool) pool = SETS.lower + SETS.digits;

    let pwd = '';
    const bytes = crypto.randomBytes(length * 2);
    for (let i = 0; i < length; i++) {
        pwd += pool[bytes[i] % pool.length];
    }
    return pwd;
}

function strength(pwd) {
    let score = 0;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (pwd.length >= 16) score++;
    if (pwd.length >= 24) score++;
    if (score <= 2) return '🔴 Weak';
    if (score <= 4) return '🟡 Medium';
    return '🟢 Strong';
}

module.exports = {
    command: new Command(
        'password',
        'Generate a cryptographically secure password',
        '.password [length] [--no-symbols | --no-upper | --digits-only]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔐');

            let length = parseInt(args[0]) || 16;
            if (length < 4)   length = 4;
            if (length > 128) length = 128;

            const flags = args.join(' ').toLowerCase();
            const opts = {
                upper:  !flags.includes('--no-upper'),
                lower:  !flags.includes('--no-lower'),
                digits: true,
                symbol: !flags.includes('--no-symbols') && !flags.includes('--digits-only') && !flags.includes('--simple')
            };
            if (flags.includes('--digits-only')) {
                opts.upper = false; opts.lower = false; opts.symbol = false; opts.digits = true;
            }

            // Generate 3 options so user can pick
            const p1 = generate(length, opts);
            const p2 = generate(length, opts);
            const p3 = generate(length, opts);

            await reply(
                `🔐 *Password Generator*\n\n` +
                `📏 Length  : ${length} characters\n` +
                `🔠 Symbols : ${opts.symbol ? 'Yes' : 'No'}\n` +
                `🔢 Digits  : Yes\n` +
                `🔡 Case    : ${opts.upper && opts.lower ? 'Mixed' : opts.upper ? 'Upper' : 'Lower'}\n\n` +
                `Option 1:\n\`${p1}\`\n${strength(p1)}\n\n` +
                `Option 2:\n\`${p2}\`\n${strength(p2)}\n\n` +
                `Option 3:\n\`${p3}\`\n${strength(p3)}\n\n` +
                `_⚠️ Delete this message after saving your password._`
            );
        }
    ),
    aliases: ['genpass', 'passgen', 'pw', 'passwd']
};
