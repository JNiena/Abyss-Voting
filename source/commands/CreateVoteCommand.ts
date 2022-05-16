import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction, Guild, GuildChannel, MessageEmbed, TextBasedChannel, TextChannel } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ChannelType } from "discord-api-types/v10";

import { EmojiSelector } from "../cmdutils/EmojiSelector";


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
					.addChannelTypes(ChannelType.GuildText)
					.setDescription("the channel to send the poll in")
					.setRequired(false))
			.addStringOption(option =>
				option.setName("emoji-mode")
					.setDescription("the category of emojis used in the poll")
					.addChoices({name: "Numbers", value: "Numbers"}, {name: "Random Emojis", value: "Random Emojis"}, {name: "Custom Emojis", value: "Custom Emojis"})
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
		const title = interaction.options.getString("title")!;
		const answers = interaction.options.getString("answers")!;
		let channel = interaction.options.getChannel("channel") as TextBasedChannel | null;
		const emojiMode = interaction.options.getString("emoji-mode");
		const showChart = interaction.options.getBoolean("show-chart");
		const duration = interaction.options.getString("duration");
		const maxChanges = interaction.options.getNumber("max-changes");
		const maxVotes = interaction.options.getNumber("max-votes");

		const answerList = answers.split("|");

		if (answerList.length <= 1) {
			await interaction.reply({content: "You need more than 1 option!", ephemeral: true});
			return;
		}
		else if (answerList.length > 24) {
			await interaction.reply({content: "You have too many options!", ephemeral: true});
			return;
		}

		if (!channel && interaction.channel) {
			channel = interaction.channel;
		}

		await interaction.deferReply({ephemeral: true});

		let voteEmbed = new MessageEmbed()
			.setColor("#0099ff")
			.setTitle(title)
			.addField("Total Votes", "1")
			.setTimestamp();

		voteEmbed = EmojiSelector.addEmojisToVote(interaction, voteEmbed, answerList, emojiMode);

		await interaction.editReply({content: "Vote created successfully!"});

		return channel?.send({embeds: [voteEmbed]});
	}

}