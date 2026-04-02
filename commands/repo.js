// commands/repo.js
const axios = require('axios');

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
        'repo',
        'Get bot repository information',
        '.repo',
        'general',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('💜');

            try {
                // Replace with your actual GitHub repo
                const giftedRepo = 'your-username/blu3bot';
                const response = await axios.get(`https://api.github.com/repos/${giftedRepo}`);
                const repoData = response.data;
                
                const { name, stargazers_count, forks_count, created_at, updated_at, owner } = repoData;
                
                const repoMessage = `
╔═══════════════════════╗
║      💜 *REPO*        ║
╠═══════════════════════╣
║ 📁 *Name:* ${name}
║ ⭐ *Stars:* ${stargazers_count}
║ 🍴 *Forks:* ${forks_count}
║ 📅 *Created:* ${new Date(created_at).toLocaleDateString()}
║ 🔄 *Updated:* ${new Date(updated_at).toLocaleDateString()}
║ 👨‍💻 *Owner:* ${owner.login}
╚═══════════════════════╝

🔗 *URL:* https://github.com/${giftedRepo}

*"Open source and thriving"*
                `.trim();

                await reply(repoMessage);
                
            } catch (error) {
                console.error('Repo command error:', error);
                await reply('❌ Failed to fetch repository information. Please try again later.');
            }
        }
    ),
    execute: async (reply, react, from, message, args, Blu3Bot, context) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot, context);
    }
};