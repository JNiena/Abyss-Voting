import { InteractionHandler, InteractionHandlerTypes, PieceContext } from '@sapphire/framework';
import { ButtonInteraction } from 'discord.js';

import VoteExecutor from '../cmdutils/VoteExecutor';


export default class VoteButtonHandler extends InteractionHandler {
	public constructor(ctx: PieceContext) {
		super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
	}

	public async run(interaction: ButtonInteraction) {
		try {
			VoteExecutor.registerVoteAction(interaction);
		}
		catch (e) {
			if (e instanceof Error) {
				interaction.reply({ content: e.message });
				return;
			}
		}
	}

	public async parse(interaction: ButtonInteraction) {
		if (interaction.customId.startsWith("voteButton")) return this.some();

		return this.none();
	}
}