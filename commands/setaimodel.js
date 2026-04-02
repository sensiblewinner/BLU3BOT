// commands/setaimodel.js — Set default AI model for .ai / .gpt commands
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

if (!global.defaultAIModel) global.defaultAIModel = 'gpt';

const MODELS = {
    gpt:      { label: 'ChatGPT (OpenAI)',   emoji: '🧠', cmd: 'gpt',      aliases: ['ai', 'chatgpt', 'openai'] },
    bard:     { label: 'Bard / Gemini',       emoji: '🔮', cmd: 'bard',     aliases: ['gemini'] },
    llama:    { label: 'Meta LLaMA',          emoji: '🦙', cmd: 'llama',    aliases: ['metaai', 'llamaai'] },
    deepseek: { label: 'DeepSeek R1',         emoji: '🌊', cmd: 'deepseek', aliases: ['ds'] },
    chat:     { label: 'Memory Chat',         emoji: '💬', cmd: 'chat',     aliases: [] },
};

module.exports = {
    command: new Command(
        'setaimodel',
        'Set which AI model is used when someone sends .ai or .gpt',
        '.setaimodel [gpt | bard | llama | deepseek | chat]',
        'owner',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🤖');

            const input = args[0]?.toLowerCase();
            const current = MODELS[global.defaultAIModel] || MODELS['gpt'];

            if (!input || input === 'list') {
                const list = Object.entries(MODELS)
                    .map(([key, m]) =>
                        `  ${key === global.defaultAIModel ? '✅' : '  '} ${m.emoji} *${key}* — ${m.label}`
                    )
                    .join('\n');

                await reply(
                    `🤖 *AI Model Selector*\n\n` +
                    `Current: ${current.emoji} *${current.label}*\n\n` +
                    `${list}\n\n` +
                    `Usage: \`.setaimodel llama\``
                );
                return;
            }

            const model = MODELS[input];
            if (!model) {
                await reply(`❌ Unknown model \`${input}\`\n\nChoose: ${Object.keys(MODELS).join(', ')}`);
                return;
            }

            global.defaultAIModel = input;

            await react('✅');
            await reply(
                `${model.emoji} *Default AI Model Changed*\n\n` +
                `Now using: *${model.label}*\n\n` +
                `Users who send \`.ai\` or \`.gpt\` will be routed to \`.${model.cmd}\``
            );
        }
    ),
    ownerOnly: true,
    aliases: ['aimodel', 'defaultai', 'setai', 'changeai']
};
