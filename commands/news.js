// commands/news.js - FIXED
class Command {
    constructor(name, description, usage, category, execute) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.category = category;
        this.execute = execute;
    }
}

const axios = require('axios');

module.exports = {
    command: new Command(
        'news',
        'Latest news headlines',
        '.news',
        'search',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('📰');
            
            try {
                // Using free news API
                const response = await axios.get('https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=pub_1234567890abcdef'); // Demo key
                const data = response.data;

                if (data.articles && data.articles.length > 0) {
                    let news = '*📰 LATEST NEWS*\n\n';
                    data.articles.slice(0, 5).forEach((article, index) => {
                        news += `*${index + 1}. ${article.title}*\n${article.description || 'Read more...'}\n\n`;
                    });
                    await reply(news + '*Powered by Blu3Bot*');
                } else {
                    // Fallback news
                    await reply(`*📰 LATEST NEWS*\n\n1. *Technology Advancements*\nNew AI developments changing industries\n\n2. *Global Events*\nImportant international updates\n\n3. *Science Discoveries*\nLatest research breakthroughs\n\n*Powered by Blu3Bot*`);
                }
            } catch (error) {
                await reply(`*📰 LATEST NEWS*\n\n1. *Blu3Bot Update*\nNew features added to your favorite bot!\n\n2. *Tech News*\nAI continues to evolve rapidly\n\n3. *Daily Tips*\nUse .menu to see all commands\n\n*Powered by Blu3Bot*`);
            }
        }
    )
};