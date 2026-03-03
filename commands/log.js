// chore: add logging granualarity for easier log viewing 

const { SlashCommandBuilder } = require('discord.js');
const fs = require("fs");
const path = require("path");

const logPath = path.join(__dirname, '../logs.txt');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('log')
        .setDescription('Admin-Only: dumps the last x log entries.')
        .addIntegerOption(option =>
            option
            .setName('lines')
            .setDescription('Number of log lines to retrieve (default 50).')
            .setRequired(false)
        ),
    async execute(interaction) {
        const adminId = process.env.ADMIN_USER_ID;
        const isAdmin = interaction.user.id === adminId;

        // this is a bot-admin-only command, so the first thing ineffa does is check if the user's ID matches the `ADMIN_USER_ID` set in .env.

        if (!isAdmin) {
            return interaction.reply({ 
                content: "Only the bot administrator can use this command.",
                ephemeral: true
            });
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            const lines = interaction.options.getInteger('lines') || 50;

            if (!fs.existsSync(logPath)) {
                return interaction.editReply("Log file not found.");
            }

            const logData = fs.readFileSync(logPath, 'utf-8').trim().split('\n');
            const recentLogs = logData.slice(-lines).join('\n');

            const dumpPath = path.join(process.cwd(), 'logs.txt');
            const header = `\n\n=== Ineffa Log Dump ===\nRequested by: ${interaction.user.tag} (${interaction.user.id})\nTimestamp: ${new Date().toLocaleString()}\n\n`;
            const footer = `\n\n=== End of Log Dump ===\n`;

            fs.appendFileSync(dumpPath, header, "utf8");
            fs.appendFileSync(dumpPath, recentLogs + "\n", "utf8");
            await new Promise(resolve => setImmediate(resolve));
            fs.appendFileSync(dumpPath, footer + "\n", "utf8");

            await interaction.editReply({
                content: `Log dump created with the last ${lines} lines.`,
            });

            /*
             * the log data is read from `logs.txt`, and the most recent lines are selected.
             * a header and footer are added to the log dump for clarity and the result is appended back to the `logs.txt` file.
             * this creates a clear, timestamped record of who requested the logs and when.
             */
            
        } catch (error) {
            console.error("Error executing log command:", error);
            await interaction.editReply("Failed to create log dump file.");
        }
    },
};