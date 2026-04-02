// commands/pick.js — Random picker + coin flip + dice roll
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

function rollDice(notation) {
    // Parses e.g. "2d6", "1d20", "d6"
    const match = notation.toLowerCase().match(/^(\d*)d(\d+)([+-]\d+)?$/);
    if (!match) return null;
    const count = parseInt(match[1]) || 1;
    const sides = parseInt(match[2]);
    const mod   = parseInt(match[3]) || 0;
    if (count > 100 || sides > 10000) return null;
    const rolls = [];
    for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
    const total = rolls.reduce((a, b) => a + b, 0) + mod;
    return { rolls, total, mod, count, sides };
}

module.exports = {
    command: new Command(
        'pick',
        'Randomly pick from options, flip a coin, or roll dice',
        '.pick [a | b | c ...] — or .pick coin — or .pick 2d6',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎲');

            if (!args[0]) {
                await reply(
                    '🎲 *Pick / Decide*\n\n' +
                    'Examples:\n' +
                    '• `.pick Pizza | Burger | Sushi` — picks one\n' +
                    '• `.pick coin` — flips a coin\n' +
                    '• `.pick 2d6` — rolls 2 six-sided dice\n' +
                    '• `.pick d20` — rolls a d20\n' +
                    '• `.pick Yes | No | Maybe` — makes a decision'
                );
                return;
            }

            const input = args.join(' ').trim();

            // Coin flip
            if (input.toLowerCase() === 'coin' || input.toLowerCase() === 'flip') {
                const result = Math.random() < 0.5 ? 'HEADS 🪙' : 'TAILS 🪙';
                await reply(`🪙 *Coin Flip*\n\n${result}`);
                return;
            }

            // Dice notation
            if (/^\d*d\d+([+-]\d+)?$/i.test(input)) {
                const dice = rollDice(input);
                if (!dice) { await reply('❌ Invalid dice notation. Try `2d6` or `d20`.'); return; }
                const rollStr = dice.count > 1 ? `[${dice.rolls.join(', ')}]` : dice.rolls[0];
                const modStr  = dice.mod !== 0 ? ` ${dice.mod > 0 ? '+' : ''}${dice.mod} = ${dice.total}` : '';
                await reply(
                    `🎲 *Dice Roll — ${input.toUpperCase()}*\n\n` +
                    `Result: ${rollStr}${modStr}\n` +
                    (dice.count > 1 ? `Total : *${dice.total}*\n` : '') +
                    `Range : 1–${dice.sides * dice.count}${dice.mod ? ` ${dice.mod > 0 ? '+' : ''}${dice.mod}` : ''}`
                );
                return;
            }

            // Option picker — split by | or comma or "or"
            const options = input
                .split(/\s*[|,]\s*|\s+or\s+/i)
                .map(o => o.trim())
                .filter(o => o.length > 0);

            if (options.length < 2) {
                await reply('⚠️ Provide at least 2 options separated by `|` or `,`\nExample: `.pick Pizza | Burger | Sushi`');
                return;
            }

            // Shuffle and pick
            const winner = options[Math.floor(Math.random() * options.length)];
            const list = options.map((o, i) => `  ${o === winner ? '👉' : '  '} ${o}`).join('\n');

            await reply(
                `🎲 *Random Picker*\n\n` +
                `${list}\n\n` +
                `✅ *Chosen: ${winner}*`
            );
        }
    ),
    aliases: ['decide', 'choose', 'dice', 'roll', 'coin', 'flip']
};
