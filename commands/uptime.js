const { SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const { formatDuration } = require('../utils.js');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('Displays how long Ineffa has been online.'),

        async execute(interaction) {
            const uptime = formatDuration(interaction.client.uptime);

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setTitle("Ineffa's Uptime")
                .setDescription(`Ineffa has been operational for: **${uptime}**.`)
                .setFooter({ text: "System Status Report." })
                .setTimestamp();

            /*
             * this provides the bot's uptime in milliseconds.
             * the `formatDuration` util function is used to convert this into a more readable format (e.g., "2d, 3h, 4m, 5s").
             */

            await interaction.reply({ embeds: [embed] });
        },
};