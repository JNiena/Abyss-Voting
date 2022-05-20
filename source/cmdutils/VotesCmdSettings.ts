import { TextBasedChannel } from "discord.js";

type VoteCmdSetting = {
    title: string,
    answers: string[],
    channel: TextBasedChannel | null,
    emojiMode: string | null,
    showChart: boolean | null,
    duration: string | null,
    maxChanges: number | null,
    maxVotes: number | null
}

let votesSettings = new Map<string, VoteCmdSetting>();

export default votesSettings;