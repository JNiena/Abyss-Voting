import { TextBasedChannel } from "discord.js";

export type VoteCmdSettings = {
    title: string,
    options: string[],
    channel: TextBasedChannel | null,
    emojiMode: string | null,
    showChart: boolean | null,
    duration: string | null,
    maxChanges: number | null,
    maxVotes: number | null
}

export type Vote = {
    userId: string,
    pollId: string,
    optionID: number,
    createdAt: string
}

export type Poll = {
    name: string,
    id: string,
    userID: string,
    settings: VoteCmdSettings,
    options: string[],
    votes: Vote[],
    messageID: string,
    createdAt: string
}