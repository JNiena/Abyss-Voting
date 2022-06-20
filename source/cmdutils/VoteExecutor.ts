import { ButtonInteraction, Message, MessageEmbed } from "discord.js";
import moment from "moment";
import { Poll, Vote } from "./Poll";
import { VoteDBUtils } from "./VoteDBUtils";


export default class VoteExecutor {

    private static userPollData: { [pollID: string]: {
        [userId: string]: {
            isRemoving: boolean,
            hasRemoved: boolean,
            numChanges: number,
            timeout?: NodeJS.Timeout
        }
    }} = {};

    private static timeToCancelDelete = 10;

    public static async registerVoteAction(interaction: ButtonInteraction) {
        const [, pollID, optionID] = interaction.customId.split("-");

        const userId = interaction.user.id;

        const poll = await VoteDBUtils.findOne<Poll>({
            id: pollID
        });

        if (!poll) return interaction.reply({content: "This poll could not be found!", ephemeral: true});
        
        const totalVotes = poll.votes.length;
        const maxChanges = poll.settings.maxChanges!;

        if (optionID == "removeVote") {
            if (maxChanges <= 0) {
                return interaction.reply({content: "This poll does not allow votes to be changed!", ephemeral: true});
            }

            if (this.userPollData[pollID] === undefined) {
                this.userPollData[pollID] = {
                    userID: {
                        isRemoving: true,
                        hasRemoved: false,
                        numChanges: 0,
                        timeout: setTimeout(() => {
                            this.userPollData[pollID][userId].isRemoving = false;

                            interaction.followUp({content: "You are no longer deleting a vote.", ephemeral: true});
                        }, this.timeToCancelDelete * 1000)
                    }
                }
            }
            else if (this.userPollData[pollID][userId] === undefined) {
                this.userPollData[pollID][userId] = {
                    isRemoving: true,
                    hasRemoved: false,
                    numChanges: 0,
                    timeout: setTimeout(() => {
                        this.userPollData[pollID][userId].isRemoving = false;

                        interaction.followUp({content: "You are no longer deleting a vote.", ephemeral: true});
                    }, this.timeToCancelDelete * 1000)
                }
            }
            else if (this.userPollData[pollID][userId].isRemoving) {
                this.userPollData[pollID][userId].isRemoving = false;
                clearTimeout(this.userPollData[pollID][userId].timeout);

                return interaction.reply({content: "You are no longer deleting a vote.", ephemeral: true});
            }
            else {
                this.userPollData[pollID][userId].isRemoving = true;

                this.userPollData[pollID][userId].timeout = setTimeout(() => {
                    this.userPollData[pollID][userId].isRemoving = false;

                    interaction.followUp({content: "You are no longer deleting a vote.", ephemeral: true});
                }, this.timeToCancelDelete * 1000);
            }

            return interaction.reply({content: "Please click on the button of your vote to remove it or click the remove button again to cancel.", ephemeral: true})
        }
        else {
            const maxVotes = poll.settings.maxVotes!;
            const voteCount = this.getVoteCount(userId, poll.votes);

            if (this.userPollData[pollID] === undefined) {
                this.userPollData[pollID] = {
                    [userId]: {
                        isRemoving: false,
                        hasRemoved: false,
                        numChanges: 0
                    }
                }
            }
            else if (this.userPollData[pollID][userId] === undefined) {
                this.userPollData[pollID][userId] = {
                    isRemoving: false,
                    hasRemoved: false,
                    numChanges: 0
                }
            }
            
            if (voteCount >= maxVotes && !this.userPollData[pollID][userId].isRemoving) {
                if (maxVotes <= 1) return interaction.reply({content: "You already voted on this poll!", ephemeral: true})
                
                return interaction.reply({content: `This poll only allows voting \`${maxVotes}\` times and you already voted \`${voteCount}\` times.`, ephemeral: true});
            }

            await interaction.deferUpdate();

            if (this.userPollData[pollID][userId].isRemoving) {
                if (this.userPollData[pollID][userId].numChanges >= maxChanges) {
                    this.userPollData[pollID][userId].isRemoving = false;
                    clearTimeout(this.userPollData[pollID][userId].timeout);

                    return interaction.followUp({content: `This poll only allows changing your vote \`${maxChanges}\` times!`, ephemeral: true});
                }

                const oldLength = poll.votes.length;

                this.removeVote(userId, parseInt(optionID), poll.votes);

                if (poll.votes.length == oldLength) {
                    this.userPollData[pollID][userId].isRemoving = false;
                    clearTimeout(this.userPollData[pollID][userId].timeout);

                    return interaction.followUp({content: "There are no votes on this option to remove!", ephemeral: true});
                }
                
                await VoteDBUtils.findOneAndReplace({ id: pollID }, poll);

                let voteEmbed = (interaction.message.embeds[0] as MessageEmbed);
                const totalVotesIndex = this.getFieldIndexFromEmbed("Total Votes", voteEmbed);
    
                if (totalVotesIndex > -1) {
                    voteEmbed.fields[totalVotesIndex].value = (totalVotes - 1).toString();
                }

                this.userPollData[pollID][userId].isRemoving = false;
                clearTimeout(this.userPollData[pollID][userId].timeout);

                this.userPollData[pollID][userId].hasRemoved = true;
    
                return interaction.editReply({embeds: [voteEmbed]});
            }
            else if (this.userPollData[pollID][userId].hasRemoved) {
                this.userPollData[pollID][userId].hasRemoved = false;

                this.userPollData[pollID][userId].numChanges += 1;
            }

            const vote: Vote = {
                userId: userId,
                createdAt: moment().toDate().toUTCString(),
                optionID: parseInt(optionID),
                pollId: pollID
            }

            poll.votes.push(vote);

            await VoteDBUtils.findOneAndReplace({ id: pollID }, poll);

            let voteEmbed = (interaction.message.embeds[0] as MessageEmbed);
            const totalVotesIndex = this.getFieldIndexFromEmbed("Total Votes", voteEmbed);

            if (totalVotesIndex > -1) {
                voteEmbed.fields[totalVotesIndex].value = (totalVotes + 1).toString();
            }

            return interaction.editReply({embeds: [voteEmbed]});
        }
    }

    private static getVoteCount(userId: string, votes: Vote[]) {
        let numVotes = 0;

        for (const vote of votes) {
            if (vote.userId == userId) {
                numVotes += 1;
            }
        }

        return numVotes;
    }

    private static removeVote(userId: string, optionID: number, votes: Vote[]) {
        for (let i = 0; i < votes.length; i ++) {
            if (votes[i].userId == userId && votes[i].optionID == optionID) {
                votes.splice(i, 1);
                break;
            }
        }
    }

    private static getFieldIndexFromEmbed(fieldName: string, voteEmbed: MessageEmbed) {
        for (let i = 0; i < voteEmbed.fields.length; i++) {
            if (voteEmbed.fields[i].name == fieldName) {
                return i;
            }
        }

        return -1;
    }

    public static removePoll(pollID: string) {
        delete this.userPollData[pollID];
    }
}