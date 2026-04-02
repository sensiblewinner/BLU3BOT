// commands/enhance.js
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
        'enhance',
        'Enhance an image from a given URL using AI enhancement',
        '.enhance [image url]',
        'media',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('✨');
            
            if (!args || args.length === 0) {
                await reply('❗ Please provide the URL of the image you want to enhance.');
                return;
            }

            const imageUrl = args.join(' ');
            const enhanceUrl = `https://bk9.fun/tools/enhance?url=${encodeURIComponent(imageUrl)}`;

            try {
                await reply({
                    image: { url: enhanceUrl },
                    caption: '*Enhanced by Blu3Bot*'
                });
            } catch (error) {
                console.error("Enhance error:", error.message || error);
                await reply('⚠️ Failed to enhance the image. Please check the URL and try again.');
            }
        }
    )
};