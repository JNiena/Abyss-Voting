import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

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
        
    }
}