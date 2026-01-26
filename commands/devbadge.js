// this command is deprecated as discord no longer offers the dev badge
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readTimestamps, writeTimestamps } = require('../utils.js');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('devbadge')
        .setDescription('A command to claim the active dev badge. (Deprecated)'),
        
    async execute(interaction) {
        try {
                await interaction.deferReply({ ephemeral: true });
        
                const userID = interaction.user.id;
                const timestamps = readTimestamps();
                const lastTimestamp = timestamps[userID];
        
                const embed = new EmbedBuilder()
                    .setColor('#e62020')
                    .setTitle('Active Developer Badge Eligibility')
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true, size: 512 }))
                    .setDescription('Discord no longer offers the Active Developer Badge program. This command is deprecated.')
                    .addFields({
                        name: 'Want to know more?',
                        value: 'Visit the [support page](https://support-dev.discord.com/hc/en-us/articles/10113997751447-Active-Developer-Badge).'
                    })
                    .setTimestamp();
        
                if (lastTimestamp) {
                    embed.addFields({
                        name: 'Last Used',
                        value: `You last ran this command <t:${lastTimestamp}:R>.`
                    });
                }
        
                await interaction.editReply({
                    embeds: [embed],
                    ephemeral: true
                });
        
                timestamps[userID] = Math.floor(Date.now() / 1000);
                writeTimestamps(timestamps);
        
        } catch (error) {
            console.error('Error handling /devbadge command:', error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: 'An error occured while running this command.', ephemeral: true });
            } else {
                await interaction.reply({ content: 'An error occured while running this command.', ephemeral: true });
            }
        }
    },
};