import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import { ButtonInteraction } from 'discord.js';

import VoteExecutor from '../cmdutils/VoteExecutor';


export default class VoteButtonHandler extends InteractionHandler {
	public constructor(ctx: PieceContext) {
		super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
	}

	public async run(interaction: ButtonInteraction) {
		await interaction.reply({
			content: `You already voted on this poll!`,
			ephemeral: true
		});
	}

	public async parse(interaction: ButtonInteraction) {
		if (interaction.customId.startsWith("voteButton")) return this.some();

		return this.none();
	}
}