const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

// command module
module.exports = {
    data: new SlashCommandBuilder()
        .setName('automod-toggle')
        .setDescription('Enables or disables all AutoMod rules in this server.')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Choose whether to enable or disable all rules.')
                .setRequired(true)
                .addChoices(
                    { name: 'Enable', value: 'enable' },
                    { name: 'Disable', value: 'disable' }
                )),
                
    async execute(interaction) {
        try {
            
            /*
             * as with the automod-create command, first check is to ensure the user has the 'manage guild' permission.
             * if they don't have the permission, ineffa sends an ephemeral message and stops command execution.
             */
            
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                return interaction.reply({
                    content: 'Directive denied. You lack the necessary permissions to configure AutoMod.',
                    ephemeral: true,
                });
            }
            
            await interaction.deferReply();
            
            const statusChoice = interaction.options.getString('status');
            const shouldEnable = statusChoice === 'enable';
            
            /*
             * fetching all existing automod rules in the server.
             * returns a collection of automoderation rule objects.
             */
            
            const rules = await interaction.guild.autoModerationRules.fetch();
            
            if (rules.size === 0) {
                return interaction.editReply('No AutoMod rules were found in this server to update.');
            }
            
            let updatedCount = 0;
            for (const rule of rules.values()) {
                
                /*
                 * iterating through each rule in the collection, calling the `edit()` method and updating its `enabled` property to either `true` or `false`, based on the user's choice.
                 * allows ineffa to enable or disable all rules at once.
                 */
                
                await rule.edit({ enabled: shouldEnable });
                updatedCount++;
            }
            
            const actionText = shouldEnable ? 'Enabled' : 'Disabled';
            await interaction.editReply(`**${updatedCount}** AutoMod rule(s) have been successfully **${actionText}**.`);
            
        } catch (error) {
            console.error('Failed to toggle AutoMod rules:', error);
            
            await interaction.editReply('An error occurred. Please ensure I have the "Manage Server" permission and try again.');
        }
    },
};