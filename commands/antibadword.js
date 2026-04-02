// commands/antibadword.js
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

module.exports = {
    command: new Command(
        'antibadword',
        'Block bad words with add/remove functionality',
        '.antibadword [add/remove/list] [word]',
        'group',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔞');
            
            const [action, ...wordArgs] = args;
            const word = wordArgs.join(' ').toLowerCase();

            if (!global.badWords) global.badWords = new Map();
            if (!global.badWords.has(from)) global.badWords.set(from, new Set(['fuck', 'shit', 'asshole', 'bitch']));

            const groupBadWords = global.badWords.get(from);

            switch (action) {
                case 'add':
                    if (!word) {
                        await reply('Please provide a word to add.');
                        return;
                    }
                    groupBadWords.add(word);
                    await reply(`✅ Added "${word}" to banned words list.`);
                    break;

                case 'remove':
                    if (!word) {
                        await reply('Please provide a word to remove.');
                        return;
                    }
                    if (groupBadWords.has(word)) {
                        groupBadWords.delete(word);
                        await reply(`✅ Removed "${word}" from banned words list.`);
                    } else {
                        await reply('❌ Word not found in banned list.');
                    }
                    break;

                case 'list':
                    const wordList = Array.from(groupBadWords).join(', ') || 'No banned words';
                    await reply(`📋 *Banned Words List:*\n\n${wordList}`);
                    break;

                default:
                    await reply('Usage: .antibadword add/remove/list [word]');
            }
        }
    ),
    adminOnly: true,
    groupOnly: true
};