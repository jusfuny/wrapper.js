import {UserQuery} from "../models/User";
import {PostQuery} from "../models/Post";
import {ChatQuery} from "../models/Chat";
import {MessageQuery} from "../models/Message";

export interface MessageModel {
    id: number,
    content: string,
    chat: ChatQuery,
    author: UserQuery,
    attached: PostQuery | null,
    created_at: string,
    replying_to: MessageQuery | null
}

export interface MessageQueryModel {
    id: number,
    chat_id: number,
    content: string,
    author: UserQuery,
    created_at: string
}