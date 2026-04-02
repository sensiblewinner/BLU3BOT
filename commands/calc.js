// commands/calc.js — Safe math calculator
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

function safeEval(expr) {
    // Allow only safe characters and Math tokens
    let e = expr
        .replace(/\bsqrt\b/gi,  'Math.sqrt')
        .replace(/\bcbrt\b/gi,  'Math.cbrt')
        .replace(/\bpow\b/gi,   'Math.pow')
        .replace(/\babs\b/gi,   'Math.abs')
        .replace(/\bfloor\b/gi, 'Math.floor')
        .replace(/\bceil\b/gi,  'Math.ceil')
        .replace(/\bround\b/gi, 'Math.round')
        .replace(/\bsin\b/gi,   'Math.sin')
        .replace(/\bcos\b/gi,   'Math.cos')
        .replace(/\btan\b/gi,   'Math.tan')
        .replace(/\blog\b/gi,   'Math.log')
        .replace(/\blog2\b/gi,  'Math.log2')
        .replace(/\blog10\b/gi, 'Math.log10')
        .replace(/\bmin\b/gi,   'Math.min')
        .replace(/\bmax\b/gi,   'Math.max')
        .replace(/\bPI\b/g,     'Math.PI')
        .replace(/\bpi\b/g,     'Math.PI')
        .replace(/\bE\b/g,      'Math.E')
        .replace(/\be\b/g,      'Math.E')
        .replace(/\^/g, '**')  // support caret for exponent
        .replace(/x/gi, '*');  // support 'x' as multiply

    // Strict whitelist: digits, operators, parens, dot, space, Math.*
    if (!/^[\d\s+\-*/%().!,Math\.sqrtcbrtpowabsflorceilroundsincostalog2in10exE]+$/.test(e)) {
        throw new Error('Invalid characters in expression');
    }

    // eslint-disable-next-line no-new-func
    const result = Function('"use strict"; return (' + e + ')')();
    if (typeof result !== 'number') throw new Error('Result is not a number');
    if (!isFinite(result)) throw new Error(isNaN(result) ? 'Invalid calculation' : 'Result is too large');
    return result;
}

function fmt(n) {
    // Format nicely — avoid scientific notation for normal ranges
    if (Number.isInteger(n)) return n.toLocaleString();
    const s = parseFloat(n.toPrecision(10)).toString();
    return parseFloat(s).toLocaleString(undefined, { maximumFractionDigits: 10 });
}

module.exports = {
    command: new Command(
        'calc',
        'Safe math calculator — supports +, -, *, /, ^, sqrt, sin, cos, log, etc.',
        '.calc [expression]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🧮');

            const expr = args.join(' ').trim();

            if (!expr) {
                await reply(
                    '🧮 *Calculator*\n\n' +
                    'Examples:\n' +
                    '• `.calc 2 + 2`\n' +
                    '• `.calc (5 * 8) / 2`\n' +
                    '• `.calc sqrt(144)`\n' +
                    '• `.calc 2^10`\n' +
                    '• `.calc sin(PI/2)`\n' +
                    '• `.calc log(100)`\n\n' +
                    'Operators: + - * / ^ ** % ( )'
                );
                return;
            }

            try {
                const result = safeEval(expr);
                await reply(
                    `🧮 *Calculator*\n\n` +
                    `📥 Input : \`${expr}\`\n` +
                    `📤 Result: *${fmt(result)}*`
                );
            } catch (err) {
                await reply(`❌ *Calculation Error*\n\n${err.message}\n\nCheck your expression and try again.`);
            }
        }
    ),
    aliases: ['calculate', 'math', 'compute', '=']
};
