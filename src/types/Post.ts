import { Reaction } from "./Reaction";
import { UserQuery } from "../models/User";
import { Comment } from "../models/Comment";

export interface PostQueryModel {
    id: number,
    author_id: string,
    reactions_count: number,
    created_at: string
}

export interface PostModel {
    id: number,
    author: UserQuery,
    title: string,
    comments: Comment[],
    comments_count: number,
    isFactChecker: boolean,
    created_at: string,
    tags: string[],
    reactions: Reaction[],
    reactions_count: number,
    reacted: Reaction | null
}