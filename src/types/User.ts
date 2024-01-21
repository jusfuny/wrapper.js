import { PostQuery } from "../models/Post";
import { Badge } from "./Badge";

export interface UserModel extends UserQueryModel {
    description: string,
    posts: PostQuery[],
    posts_count: number,
    followed: boolean,
    followers_count: number,
    following_count: number,
    created_at: string,
    first_login: boolean,
    coins: number,
    links: string[]
}

export interface UserQueryModel {
    badges: Badge[],
    name: string,
    id: string
}