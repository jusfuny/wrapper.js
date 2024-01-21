import { Message, MessageQuery } from "../models/Message";

export interface WsMessage {
    type: number,
    data: Message | MessageQuery | {}
}