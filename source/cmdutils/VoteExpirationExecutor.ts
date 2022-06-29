import { Message, MessageEmbed } from "discord.js";
import { Poll, Vote } from "./Poll";
import { VoteDBUtils } from "./VoteDBUtils";

export default class VoteExpirationExecutor {

    private static expirationCache: { [pollID: string]: {
            timeout: NodeJS.Timeout
        }
    } = {};

    public static setTimeoutToClose(duration: number, pollID: string, message: Message) {
        const voteCloseTimeout = setTimeout(() => {
            this.closePoll(pollID, message);
        }, duration);

        this.expirationCache[pollID] = {
            timeout: voteCloseTimeout
        };
    }

    public static async closePoll(pollID: string, message: Message) {
        if (!pollID || !message) return;
        
        const poll = await VoteDBUtils.findOne<Poll>({
            id: pollID
        });

        console.log("Fetched Poll: " + poll);
        
        
        if (!poll) return;

        const totalVotes = poll.votes.length;

        let embed = message.embeds[0]!;        
        let resultsText = "";

        for (let i = 0; i < poll.settings.options.length; i++) {
            const voteCount = this.getVoteCount(poll.votes, i);
            const votePercentage = this.calculateVotePercentage(voteCount, totalVotes);

            resultsText += ` ${i+1}. | ${voteCount} ${voteCount > 1 ? "votes" : "vote"} | (${Intl.NumberFormat('default', {style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(votePercentage)})\n`;
        }

        resultsText = `\`\`\`${resultsText.trimEnd()}\`\`\``;

        
        if (this.getFieldIndexFromEmbed("Will end in", embed) != -1) {
            delete embed.fields[0];
        }

        const winnersOptionIds = this.getWinners(poll.votes, poll.settings.options.length);
        let winnersResults = "";
        
        for (const winnerOptionId of winnersOptionIds) {
            winnersResults += `${poll.settings.options[winnerOptionId]}, `
        }
        
        winnersResults = winnersResults.slice(0, -2);

        embed.fields.unshift({name: winnersOptionIds.length > 1 ? "Winners" : "Winner", value: winnersResults, inline: false});
        embed.fields.unshift({name: "Results", value: resultsText, inline: false});

        return await message.edit({embeds: [embed], components: []});
    }

    private static getWinners(votes: Vote[], optionCount: number) {
        const voteData: {
            [key: number]: number[]
        } = {};

        for (let i = 0; i < optionCount; i++) {
            const voteCount = this.getVoteCount(votes, i);

            if (voteData[voteCount] === undefined) {
                voteData[voteCount] = [i];
            }
            else {
                voteData[voteCount].push(i);
            }
        }

        let maxKey = -1;

        for (const key of Object.keys(voteData)) {
            if (maxKey < parseInt(key)) {
                maxKey = parseInt(key);
            }
        }

        return voteData[maxKey];
    }

    private static calculateVotePercentage(numVoteForOption: number, totalVotes: number) {
        if (totalVotes <= 0) return 0;

        return numVoteForOption / totalVotes;
    }

    private static getFieldIndexFromEmbed(fieldName: string, voteEmbed: MessageEmbed) {
        for (let i = 0; i < voteEmbed.fields.length; i++) {
            if (voteEmbed.fields[i].name == fieldName) {
                return i;
            }
        }

        return -1;
    }

    private static getVoteCount(votes: Vote[], optionID: number) {
        let total = 0;

        for (const vote of votes) {
            if (vote.optionID == optionID) {
                total += 1;
            }
        }

        return total;
    }
}