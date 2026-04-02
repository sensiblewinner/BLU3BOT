// commands/bible.js
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
        'bible',
        'Get a Bible verse from a specific book, chapter, and verse',
        '.bible [verse]',
        'general',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📖');
            
            const verse = args.join(' ');

            if (!verse) {
                await reply('Usage: .bible john 3:16');
                return;
            }

            try {
                const response = await fetch(`https://bible-api.com/${verse}`);
                if (!response.ok) {
                    await reply('Invalid reference. Try: .bible john 3:16');
                    return;
                }

                const data = await response.json();
                const bibleText = `📖 *THE HOLY BIBLE*\n\n📜 ${data.reference}\n🔢 Verses: ${data.verses.length}\n📝 ${data.text}\n🌍 Language: ${data.translation_name}\n\n*Powered by Blu3Bot*`;

                await reply(bibleText);
            } catch (error) {
                await reply('Error fetching verse.');
            }
        }
    )
};