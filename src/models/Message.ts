import {UserQuery} from "./User";
import {PostQuery} from "./Post";
import {MessageModel, MessageQueryModel} from "../types/Message";
import {Client, RequestFunc} from "../client";
import {ChatQuery} from "./Chat";
import {UnauthorizedError} from "../errors/Unauthorized";
import {UnexpectedStatusError} from "../errors/UnexpectedStatus";

export class BaseMessage {
    id: number;
    chat_id: number;

    baseUrl: string;

    constructor(
        model: {
            id: number,
            chat_id: number
        },
        protected isAuthorized: boolean,
        protected request: RequestFunc
    ) {
        this.id = model.id;
        this.chat_id = model.chat_id;

        this.baseUrl = `chats/${this.chat_id}/messages/${this.id}`;
    }

    public async delete() {
        if (!this.isAuthorized)
            throw new UnauthorizedError();

        const res = await this.request({
            url: this.baseUrl,
            method: "delete"
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);
    }
}

export class Message extends BaseMessage {
    id: number;
    content: string;
    chat: ChatQuery;
    author: UserQuery;
    attached: PostQuery | null;
    created_at: string;
    replying_to: MessageQuery | null;

    constructor(
        model: MessageModel,
        isAuthorized: boolean,
        userId: string,
        request: RequestFunc
    ) {
        super({
            id: model.id,
            chat_id: model.chat.id
        }, isAuthorized, request);
        this.id = model.id;
        this.content = model.content;
        this.chat = new ChatQuery(model.chat, userId, request);
        this.author = new UserQuery(model.author, isAuthorized, true, request);
        this.attached = model.attached ? new PostQuery(model.attached, isAuthorized, true, request) : null;
        this.created_at = model.created_at;
        this.replying_to = model.replying_to ? new MessageQuery(model.replying_to, isAuthorized, request) : null;
    }
}

export class MessageQuery {
    id: number;
    chat_id: number;
    content: string;
    author: UserQuery;
    created_at: string;

    constructor(
        model: MessageQueryModel,
        private isAuthorized: boolean,
        private request: RequestFunc
    ) {
        this.id = model.id;
        this.chat_id = model.chat_id;
        this.content = model.content;
        this.author = new UserQuery(model.author, isAuthorized, true, request);
        this.created_at = model.created_at;
    }
}