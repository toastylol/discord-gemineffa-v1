const { SlashCommandBuilder } = require('discord.js');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('setlimit')
        .setDescription('Sets the conversation history fetch limit.')
        .addIntegerOption(option =>
            option.setName('limit')
                .setDescription('The number of past messages to fetch for context (1-100).')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)), // max limit allowed by discord
    
    async execute(interaction) {
        if (interaction.user.id !== process.env.ADMIN_USER_ID) {
            return interaction.reply(`Directive denied. You lack the necessary permissions to execute this command. Ineffa recommends contacting <@${process.env.ADMIN_USER_ID}> to use it.`);
        }

        const newLimit = interaction.options.getInteger('limit');
        
        interaction.client.conversationFetchLimit = newLimit;

        await interaction.reply({
            content: `System log parameters adjusted. Capacity set to **${newLimit}** messages.`,
        });
    },
};