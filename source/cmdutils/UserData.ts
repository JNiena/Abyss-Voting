import { Poll, Vote } from "./Poll"

export type UserVoteData = {
    userID: string,
    polls: Poll[],
    votes: Vote[]
}