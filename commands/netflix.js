// commands/netflix.js
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
        'netflix',
        'Netflix download info',
        '.netflix',
        'download',
        async (reply, react, from, message, args, Blu3Bot, context) => {
            await react('🎬');
            await reply(
                `🎬 *Netflix Download*\n\n` +
                `❌ Netflix content *cannot be downloaded* by any bot or tool.\n\n` +
                `*Why?*\nNetflix uses *Widevine DRM* (Digital Rights Management), a studio-grade encryption system built directly into Chrome, Android, and Smart TVs. There is no legitimate or working tool that can bypass it.\n\n` +
                `*Alternatives:*\n` +
                `• Download via the *official Netflix app* (allows offline viewing on mobile/tablet while your subscription is active)\n` +
                `• Use *.youtube*, *.reddit*, or *.tiktok* for freely available content\n\n` +
                `_Attempting to bypass Netflix DRM also violates their Terms of Service._`
            );
        }
    )
};
