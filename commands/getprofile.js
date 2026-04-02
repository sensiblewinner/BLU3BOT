// commands/getprofile.js
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
        'getprofile',
        'Get user profile info',
        '.getprofile [@mention or reply]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('👤');
            
            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned || context.sender;

            try {
                const profile = await Blu3Bot.profilePictureUrl(target, 'image');
                
                await reply({
                    image: { url: profile },
                    caption: `*👤 PROFILE INFO*\n\n*User:* @${target.split('@')[0]}\n*JID:* ${target}\n\n*Powered by Blu3Bot*`,
                    mentions: [target]
                });
            } catch (error) {
                await reply({
                    text: `*👤 PROFILE INFO*\n\n*User:* @${target.split('@')[0]}\n*JID:* ${target}\n*Status:* No profile picture\n\n*Powered by Blu3Bot*`,
                    mentions: [target]
                });
            }
        }
    )
};