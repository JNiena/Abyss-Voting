import { ApplicationCommandRegistry, Command, RegisterBehavior } from "@sapphire/framework";
import { CommandInteraction, MessageActionRow, MessageActionRowComponent, MessageActionRowComponentResolvable, MessageEmbed, TextBasedChannel, TextChannel } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { APIActionRowComponent, APIMessageActionRowComponent, ChannelType } from "discord-api-types/v10";
import uniqid from 'uniqid';

import EmojiSelector from "../cmdutils/EmojiSelector";
import DurationSerializer from "../cmdutils/DurationSerializer";
import VoteExpirationExecutor from "../cmdutils/VoteExpirationExecutor";
import moment from "moment";
import { Poll, VoteCmdSettings } from "../cmdutils/Poll";
import { VoteDBUtils } from "../cmdutils/VoteDBUtils";
import PollsCache from "../cmdutils/PollsCache";

export default class CreateVoteCommand extends Command {

	public constructor(context: Command.Context, options: Command.Options) {
		super(context, {
			...options,
			name: "create-vote",
			description: "Creates a new vote"
		});
	}

	public registerApplicationCommands(registry: ApplicationCommandRegistry) {
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
					.setDescription("the type of emojis that should be used in this poll")
					.addChoices({name: "Numbers", value: "Numbers"},
								{name: "Random Emojis", value: "Random Emojis"},
								{name: "Custom Emojis", value: "Custom Emojis"})
					.setRequired(false))
			.addBooleanOption(option =>
				option.setName("show-chart")
					.setDescription("whether to show a chart after the poll finished or not")
					.setRequired(false))
			.addStringOption(option =>
				option.setName("duration")
					.setDescription("the amount of time after which this poll should expire")
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
		let maxChanges = interaction.options.getNumber("max-changes");
		let maxVotes = interaction.options.getNumber("max-votes");

		const pollId = uniqid();

		const maxOptionLength = 50;

		const answerList = answers.split("|");

		for (const answer of answerList) {
			if (answer.length > maxOptionLength) {
				return interaction.reply({content: `The option \`${answer}\` exceeds the maximum length of \`${maxOptionLength}\` chars!`, ephemeral: true});
			}
		}

		await interaction.deferReply({ephemeral: true});

		if (!channel && interaction.channel) channel = interaction.channel;
		if (!maxChanges) maxChanges = 0;
		if (!maxVotes) maxVotes = 1;

		try {
			let voteEmbed = new MessageEmbed()
			.setColor("#0099ff")
			.setTitle(title)
			.setTimestamp();

			let voteDuration: moment.Duration | null = null;

			let components: MessageActionRow<MessageActionRowComponent, MessageActionRowComponentResolvable, APIActionRowComponent<APIMessageActionRowComponent>>[] = [];

			({voteEmbed, components} = EmojiSelector.addEmojisToVote(voteEmbed, answerList, emojiMode, pollId));

			if (duration) {
				let currTimeStamp = moment();
				voteDuration = DurationSerializer.getParsedDuration(duration);
				const futureTimeStamp = currTimeStamp.add(voteDuration);
				
				voteEmbed.addField("Will end in", `<t:${futureTimeStamp.unix()}:R>`);
				voteEmbed.addField("Total Votes", "0");
			}
			else {
				voteEmbed.addField("Total Votes", "0");
			}

			await interaction.editReply({content: "Vote created successfully!"});
			
			return channel?.send({embeds: [voteEmbed], components: components}).then(async message => {
				const voteCmdSettings: VoteCmdSettings = {
					title: title,
					options: answerList,
					channel: channel?.id,
					duration: duration,
					emojiMode: emojiMode,
					showChart: showChart,
					maxChanges: maxChanges,
					maxVotes: maxVotes
				}

				const pollData: Poll = {
					name: title,
					id: pollId,
					userID: interaction.user.id,
					settings: voteCmdSettings,
					createdAt: moment().toDate().toUTCString(),
					messageID: message.id,
					votes: []
				}

				const insertResult = await VoteDBUtils.insertOne<Poll>(pollData);
				
				PollsCache[title] = {
					pollID: pollId,
					messageID: message.id
				};

				if (voteDuration) VoteExpirationExecutor.setTimeoutToClose(voteDuration.asMilliseconds(), pollId, message);
			});
		}
		catch (e) {
			if (e instanceof Error) {
				interaction.editReply({content: e.message});
				return;
			}
		}
	}

}