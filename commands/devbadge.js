const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { readTimestamps, writeTimestamps } = require('../utils.js');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('devbadge')
        .setDescription('A command to claim the active dev badge.'),
        
    async execute(interaction) {
        try {
                await interaction.deferReply({ ephemeral: true });
        
                const userID = interaction.user.id;
                const timestamps = readTimestamps();
                const lastTimestamp = timestamps[userID];
        
                const embed = new EmbedBuilder()
                    .setColor('#20e620')
                    .setTitle('Active Developer Badge Eligibility')
                    .setDescription('This command has been executed successfully. You should be eligible for the **Active Developer Badge** within 24 hours.')
                    .addFields({
                        name: 'Next Steps',
                        value: 'Visit the [claim page](https://discord.com/developers/active-developer) after 24 hours to claim your badge.'
                    })
                    .setTimestamp()
                    .setFooter({ text: 'Eligibility Check' });
        
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