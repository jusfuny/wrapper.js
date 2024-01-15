import {ReplyModel} from "./Reply";
import {UserQueryModel} from "./User";

export interface CommentModel {
    id: number,
    likes_count: number,
    liked: boolean,
    replies_count: number,
    replies: ReplyModel[],
    created_at: string,
    author: UserQueryModel,
    data: string
}