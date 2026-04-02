// commands/pair.js
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
        'pair',
        'Generates a pairing code for a phone number',
        '.pair [number]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🔗');
            
            if (!args || args.length === 0) {
                await reply('Please provide a phone number to generate a pairing code.');
                return;
            }

            const number = args.join(' ').trim();
            const url = `https://flash-v2-session.onrender.com/code?number=${encodeURIComponent(number)}`;

            try {
                await reply('*Blu3Bot is generating your pairing code...*');

                const response = await axios.get(url);
                const data = response.data;

                if (!data?.code) {
                    await reply('Could not retrieve the pairing code. Please check the number and try again.');
                    return;
                }

                await reply(`*Pairing Code for ${number} is the digits below ⤵️!*\n\n> *Powered by Blu3Bot*`);
                await reply(`\`\`\`${data.code}\`\`\``);

            } catch (error) {
                console.error('Pairing Code Error:', error);
                await reply('There was an error processing your request. Please try again later.');
            }
        }
    )
};