import {ApplicationCommandRegistry, Command, RegisterBehavior} from "@sapphire/framework";
import {CommandInteraction, MessageEmbed} from "discord.js";
import {SlashCommandBuilder} from "@discordjs/builders";
import {ChannelType} from "discord-api-types";

export class CreateVoteCommand extends Command {

	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: "create-vote",
			description: "Creates a new vote"
		});
	}

	public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
		const builder = new SlashCommandBuilder()
			.setName(this.name)
			.setDescription("Creates a new vote")
			.addStringOption(option =>
				option.setName("title")
					.setDescription("the title of the vote")
					.setRequired(true))
			.addStringOption(option =>
				option.setName("answers")
					.setDescription("a pipe (|) seperated list of available options")
					.setRequired(true))
			.addChannelOption(option =>
				option.setName("channel")
					.addChannelType(ChannelType.GuildText)
					.setDescription("the channel to send the poll in")
					.setRequired(false))
			.addStringOption(option =>
				option.setName("emoji-mode")
					.setDescription("the category of emojis used in the poll")
					.addChoice("Numbers", "Numbers")
					.addChoice("Random Emojis", "Random Emojis")
					.setRequired(false))
			.addBooleanOption(option =>
				option.setName("show-chart")
					.setDescription("whether to show a chart after the poll finished or not")
					.setRequired(false))
			.addStringOption(option =>
				option.setName("duration")
					.setDescription("amount of time after which this poll should expire")
					.setRequired(false))
			.addNumberOption(option =>
				option.setName("max-changes")
					.setDescription("the number of times a user is allowed to change their vote")
					.setRequired(false))
			.addNumberOption(option =>
				option.setName("max-votes")
					.setDescription("the number of times a user is allowed to vote"));

		registry.registerChatInputCommand(builder, {behaviorWhenNotIdentical: RegisterBehavior.Overwrite, idHints: ["974010187889389659"]});
	}

	public async chatInputRun(interaction: CommandInteraction) {

		const title = interaction.options.getString("title");
		const answers = interaction.options.getString("answers");
		const channel = interaction.options.getChannel("channel");
		const emojiMode = interaction.options.getString("emoji-mode");
		const showChart = interaction.options.getBoolean("show-chart");
		const duration = interaction.options.getString("duration");
		const maxChanges = interaction.options.getNumber("max-changes");
		const maxVotes = interaction.options.getNumber("max-votes");

		await interaction.reply({content: "Vote created successfully!", ephemeral: true});

		const voteEmbed = new MessageEmbed()
			.setColor("#0099ff")
			.setTitle("someTitle")
			.setDescription("some description")
			.addFields(
				{name: "Regular field title", value: "Some value here"},
				{name: "Total Votes", value: "69", inline: true}
			)
			.setTimestamp()
			.setFooter({text: "Some footer text here"});

		return interaction.channel?.send({embeds: [voteEmbed]});
	}

}