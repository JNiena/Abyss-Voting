import { ButtonInteraction } from "discord.js";
import { MongoClient } from "mongodb";

/**
 * if maxChanges is 0, then maxVotes takes precedence
 * if maxChanges is > 0, then maxChanges takes precedence
 */

export default class VoteExecutor {

    public static registerVote(interaction: ButtonInteraction) {
        const [btnName, pollID, optionID] = interaction.customId.split("-");

        
    }
}