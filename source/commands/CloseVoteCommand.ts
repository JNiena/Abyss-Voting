import { ApplicationCommandRegistry, AutocompleteCommand, Command, RegisterBehavior } from "@sapphire/framework";
import { SlashCommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, CommandInteraction } from "discord.js";
import VoteExpirationExecutor from "../cmdutils/VoteExpirationExecutor";
import PollsCache from "../cmdutils/PollsCache";

export default class CloseVoteCommand extends Command {

    public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: "close-vote",
			description: "Closes a vote"
		});
	}

    public registerApplicationCommands(registry: ApplicationCommandRegistry) {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
			.setDescription("Closes a vote")
            .addStringOption(option =>
				option.setName("poll")
					.setDescription("the message link or id of the poll you want to close")
                    .setAutocomplete(true)
					.setRequired(true));
                    
        registry.registerChatInputCommand(builder, {behaviorWhenNotIdentical: RegisterBehavior.Overwrite, idHints: ["988417395825721394"]});
    }

    public async chatInputRun(interaction: CommandInteraction) {
        const pollName = interaction.options.getString("poll");

        
        if (!pollName || !interaction.channel) return interaction.reply({content: "This poll could not be found.", ephemeral: true});
        
        const message = interaction.channel.messages.cache.get(PollsCache[pollName].messageID)
        
        if (!message) return interaction.reply({content: "This poll has already been deleted or closed!", ephemeral: true});
        
        VoteExpirationExecutor.closePoll(PollsCache[pollName].pollID, message);
        delete PollsCache[pollName];

        return interaction.reply({content: "This poll was closed!", ephemeral: true});
    }

    public async autocompleteRun(interaction: AutocompleteInteraction) {
        const focusedValue = interaction.options.getFocused() as string;

        const choices = Object.keys(PollsCache);
        
		const filtered = choices.filter(choice => choice.includes(focusedValue));

		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
    }
}