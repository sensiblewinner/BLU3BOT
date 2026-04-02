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
        'Silently fetch a user profile picture to owner DM',
        '.getprofile [@mention or reply]',
        'tools',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            const quoted = message.message?.extendedTextMessage?.contextInfo?.participant;
            const mentioned = message.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
            const target = quoted || mentioned || context.sender + '@s.whatsapp.net';

            const ownerJid = context.ownerJid || context.config?.OWNER_NUMBER;

            try {
                const profileUrl = await Blu3Bot.profilePictureUrl(target, 'image');

                await Blu3Bot.sendMessage(ownerJid, {
                    image: { url: profileUrl },
                    caption: `👤 *PROFILE LOOKUP*\n\n*User:* @${target.split('@')[0]}\n*JID:* ${target}\n\n_Delivered silently_`,
                    mentions: [target]
                });
            } catch {
                await reply(
                    `👤 *PROFILE LOOKUP*\n\n*User:* @${target.split('@')[0]}\n*JID:* ${target}\n*Status:* No profile picture set`
                );
            }
        }
    ),
    stealth: true
};
