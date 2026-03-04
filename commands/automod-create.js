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
                
                /*
                 * before this command does anything, perform a check to see if the user who used the command has the 'manage guild' permission.
                 * this is a security check to ensure that only authorized users can create or modify automod rules.
                 * if they don't have the permission, ineffa sends an ephemeral message and stops command execution.
                 */
                
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
                        
                        /*
                         * this section handles the 'keyword' subcommand.
                         * it splits the user-provided string of keywords into an array, trimming whitespace and removing any empty entries.
                         * it checks if any valid keywords were provided and sends an error if not, if valid keywords are present, it creates an automod rule.
                         * it's triggered when a message is sent (`messagesend` event).
                         * the trigger type is `keyword`, which means it looks for specific words in messages.
                         * the `keywordfilter` in `triggermetadata` is set to the array of keywords provided by the user.
                         * if a message contains any of these keywords, the `blockmessage` action is taken and a custom message is sent to inform the user why their message was blocked.
                         */
                        
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
                        
                        /*
                         * this creates an automod rule specifically for mention spam.
                         * it's triggered when a message is sent.
                         * the `mentionspam` trigger type activates when the number of unique user and role mentions in a single message exceeds the `mentionTotalLimit` (the threshold set by the user).
                         * if triggered, it blocks the message and sends a custom explanation.
                        */
                        
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