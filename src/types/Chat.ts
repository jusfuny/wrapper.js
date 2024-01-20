import { UserQuery } from "../models/User";
import { MessageQuery } from "../models/Message";

export interface ChatModel {
    id: number,
    name: string,
    type: number,
    participants: UserQuery[],
    last_message: MessageQuery | null,
    image: string,
    is_read_only: boolean
}

export interface ChatQueryModel {
    id: number,
    name: string,
    type: number,
    last_message: MessageQuery | null,
    image: string,
    is_read_only: boolean
}
