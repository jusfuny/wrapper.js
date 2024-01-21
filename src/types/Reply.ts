import { UserQueryModel } from "./User";

export interface ReplyModel {
    id: number,
    author: UserQueryModel,
    data: string,
    likes_count: number,
    liked: boolean,
    created_at: string
}