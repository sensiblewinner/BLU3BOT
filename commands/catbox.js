// commands/catbox.js
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
        'catbox',
        'Upload any file to Catbox',
        '[reply to file]',
        'Tools',
        async (reply, react, from, message, args, Blu3Bot) => {
            // Check if message is a reply
            const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quotedMessage) {
                await react("❌");
                return reply("❌ Please reply to any file (image, video, audio, document) to upload to Catbox");
            }

            try {
                await react("📁");
                
                const catboxMessage = `
╔═══════════════════════╗
║     📁 *CATBOX*       ║
╠═══════════════════════╣
║ 🔄 *Processing file...*
║ 
║ *Catbox Features:*
║ • Any file type support
║ • 200MB file limit
║ • Direct download links
║ • No registration needed
║ 
║ *Supported Files:*
║ • Images (JPG, PNG, GIF)
║ • Videos (MP4, AVI, MKV)
║ • Audio (MP3, WAV, M4A)
║ • Documents (PDF, DOC, ZIP)
║ 
║ *Current Status:*
║ Ready for implementation
╚═══════════════════════╝

*"Universal file hosting"*
                `.trim();

                await reply(catboxMessage);
                await react("✅");

            } catch (error) {
                console.error("Catbox command error:", error);
                await react("❌");
                await reply(`❌ Catbox upload failed: ${error.message}`);
            }
        }
    ),
    
    execute: async (reply, react, from, message, args, Blu3Bot) => {
        await module.exports.command.execute(reply, react, from, message, args, Blu3Bot);
    }
};