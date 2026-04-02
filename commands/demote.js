// commands/demote.js
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
        'demote',
        'Demote user from admin',
        '[reply to user]',
        'Group',
        async (reply, react, from, message, args, Blu3Bot) => {
            if (!from.endsWith('@g.us')) {
                await react("❌");
                return reply("❌ This command only works in groups!");
            }

            // Check if message is a reply
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage) {
                await react("❌");
                return reply("❌ Please reply to the user you want to demote!");
            }

            const quotedUser = message.message.extendedTextMessage.contextInfo.participant;
            
            if (!quotedUser) {
                await react("❌");
                return reply("❌ Could not identify the user to demote!");
            }

            try {
                await react("👑");
                await Blu3Bot.groupParticipantsUpdate(from, [quotedUser], 'demote');
                
                const userNumber = quotedUser.split('@')[0];
                await reply(`
╔═══════════════════════╗
║     📉 *DEMOTED*      ║
╠═══════════════════════╣
║ @${userNumber}
║ is no longer an admin
╚═══════════════════════╝
                `.trim());
            } catch (error) {
                await react("❌");
                await reply(`❌ Failed to demote user: ${error.message}`);
            }
        }
    ),
    
    execute: async (reply, react, from, message, args, Blu3Bot) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot);
    }
};