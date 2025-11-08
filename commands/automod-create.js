const { 
    SlashCommandBuilder, 
    PermissionsBitField, 
    AutoModerationRuleEventType, 
    AutoModerationRuleTriggerType, 
    AutoModerationActionType 
} = require('discord.js');

// command module
module.exports = {
    data: new SlashCommandBuilder() 
        .setName('automod-create')
        .setDescription('Creates an AutoMod rule with Ineffa based on selected type.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('keyword')
                .setDescription('Ineffa blocks messages containing certain keywords.')
                .addStringOption(option =>
                    option.setName('words')
                        .setDescription('The keywords to block, seperated by commas.')
                        .setRequired(true)))

        .addSubcommand(subcommand =>
            subcommand
                .setName('mentionspam')
                .setDescription('Ineffa blocks messages containing excessive user or role pings.')
                .addIntegerOption(option =>
                    option.setName('threshold')
                        .setDescription('The maximum number of unique mentions allowed per message.')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(50))), // discord's limit is 50

        async execute(interaction) {
            try {
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
                    return interaction.reply({
                        content: 'Directive denied. You lack the necessary permissions to configure AutoMod.',
                        ephemeral: true,
                    });
                }

                await interaction.deferReply({ ephemeral: true });

                const subcommand = interaction.options.getSubcommand();

                switch (subcommand) {
                    case 'keyword': {
                        const keywords = interaction.options.getString('words').split(',').map(word =>
                        word.trim()).filter(Boolean);

                        if (keywords.length === 0) {
                            return interaction.editReply('Input Rejected. PLease provide at least one valid keyword.');
                        }

                        await interaction.guild.autoModerationRules.create({
                            name: `Block Keywords (${keywords.slice(0, 2).join(',')}...) - by ${interaction.client.user.username}`,
                            enabled: true,
                            eventType: AutoModerationRuleEventType.MessageSend,
                            triggerType: AutoModerationRuleTriggerType.Keyword,
                            triggerMetadata: { keywordFilter: keywords },
                            actions: [{
                                type: AutoModerationActionType.BlockMessage,
                                metadata: { customMessage: 'This message was blocked by Ineffa for containing a prohibited word. Powered by AutoMod. '}
                            }],
                        });

                        await interaction.editReply(`AutoMod rule enabled. Messages containing the following words: "${keywords}" will now be blocked.`);
                        break;
                    }

                    case 'mentionspam': {
                        const threshold = interaction.options.getInteger('threshold');

                        await interaction.guild.autoModerationRules.create({
                            name: `Block Mention Spam (>${threshold}) - by ${interaction.client.user.username}`,
                            enabled: true,
                            eventType: AutoModerationRuleEventType.MessageSend,
                            triggerType: AutoModerationRuleTriggerType.MentionSpam,
                            triggerMetadata: { mentionTotalLimit: threshold },
                            actions: [{
                                type: AutoModerationActionType.BlockMessage,
                                metadata: { customMessage: 'This message was blocked by Ineffa for containing excessive mention spam. Powered by AutoMod. '}
                            }],
                        });

                        await interaction.editReply(`AutoMod rule enabled. Messages with more than **${threshold}** unique mentions will now be blocked.`);
                        break;
                    }
                }
            } catch (error) {
                console.error('Failed to create AutoMod rule:', error);
                await interaction.followUp({
                    content: 'An error occured. Please ensure I have the "Manage Server" permission and try again.',
                    ephemeral: true,
                });
            }
        },
};