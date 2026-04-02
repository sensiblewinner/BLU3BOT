// commands/8ball.js — Magic 8-ball
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const RESPONSES = [
    // Positive
    { text: 'It is certain.',              type: '✅' },
    { text: 'It is decidedly so.',         type: '✅' },
    { text: 'Without a doubt.',            type: '✅' },
    { text: 'Yes — definitely.',           type: '✅' },
    { text: 'You may rely on it.',         type: '✅' },
    { text: 'As I see it, yes.',           type: '✅' },
    { text: 'Most likely.',                type: '✅' },
    { text: 'Outlook good.',               type: '✅' },
    { text: 'Yes.',                        type: '✅' },
    { text: 'Signs point to yes.',         type: '✅' },
    // Neutral
    { text: 'Reply hazy, try again.',      type: '🔮' },
    { text: 'Ask again later.',            type: '🔮' },
    { text: 'Better not tell you now.',    type: '🔮' },
    { text: 'Cannot predict now.',         type: '🔮' },
    { text: 'Concentrate and ask again.',  type: '🔮' },
    // Negative
    { text: "Don't count on it.",          type: '❌' },
    { text: 'My reply is no.',             type: '❌' },
    { text: 'My sources say no.',          type: '❌' },
    { text: 'Outlook not so good.',        type: '❌' },
    { text: 'Very doubtful.',              type: '❌' },
];

module.exports = {
    command: new Command(
        '8ball',
        'Ask the magic 8-ball a yes/no question',
        '.8ball [question]',
        'fun',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const question = args.join(' ').trim();

            if (!question) {
                await react('🎱');
                await reply('🎱 Ask me a question!\nExample: `.8ball Will I pass my exam?`');
                return;
            }

            const r = RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
            await react(r.type === '✅' ? '✅' : r.type === '❌' ? '❌' : '🔮');

            await reply(
                `🎱 *Magic 8-Ball*\n\n` +
                `❓ _${question}_\n\n` +
                `${r.type} *${r.text}*`
            );
        }
    ),
    aliases: ['eightball', 'magic8', 'oracle']
};
