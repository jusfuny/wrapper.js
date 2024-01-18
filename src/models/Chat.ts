// noinspection JSUnusedGlobalSymbols

import {ChatModel, ChatQueryModel} from "../types/Chat";
import {RequestFunc} from "../client";
import {BaseMessage, Message, MessageQuery} from "./Message";
import {BasePost} from "./Post";
import {UnexpectedStatusError} from "../errors/UnexpectedStatus";
import {MessageModel} from "../types/Message";
import {UserQuery} from "./User";

class BaseChat {
    id: number;
    type: number;
    userId: string;

    baseUrl: string;

    constructor(
        model: {
            id: number,
            type: number,
            userId: string
        },
        protected request: RequestFunc
    ) {
        this.id = model.id;
        this.type = model.type;
        this.userId = model.userId;

        this.baseUrl = `chats/${model.id}`;
    }

    public async send(
        msg: {
            content: string,
            replying_to?: number | BaseMessage,
            attached?: number | BasePost
        }
    ) {
        const replying_to = (msg.replying_to instanceof BaseMessage) ? msg.replying_to.id : msg.replying_to;
        const attached = (msg.attached instanceof BasePost) ? msg.attached.id : msg.attached;
        const res = await this.request<MessageModel>({
            url: `${this.baseUrl}/messages`,
            method: "post",
            data: {
                content: msg.content,
                replying_to: replying_to,
                attached: attached
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);

        return new Message(res.data, true, this.userId, this.request);
    }

    public async editName(name: string) {
        if (this.type != 2)
            throw new Error("Chat must be a group");

        const res = await this.request({
            url: `${this.baseUrl}/name`,
            method: "patch",
            data: {
                "name": name
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);
    }

    public async addParticipants(users: UserQuery[] | string[]) {
        if (users.length == 0)
            return;

        const ids = users[0] instanceof UserQuery
            ? users.map<string>((u) => {return (u as UserQuery).id})
            : users as string[];

        const res = await this.request({
            url: `${this.baseUrl}/participants`,
            method: "post",
            data: {
                "participants": ids
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);
    }

    public async removeParticipants(users: UserQuery[] | string[]) {
        if (users.length == 0)
            return;

        const ids = users[0] instanceof UserQuery
            ? users.map<string>((u) => {return (u as UserQuery).id})
            : users as string[];

        const res = await this.request({
            url: `${this.baseUrl}/participants`,
            method: "delete",
            data: {
                "participants": ids
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);
    }

    public async getMessages(index: number, count: number): Promise<Message[]> {
        const res = await this.request<MessageModel[]>({
            url: `${this.baseUrl}/messages?i=${index}&count=${count}`
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);

        let messages: Message[] = [];
        res.data.forEach((m) => {
            messages.push(new Message(m, this.userId == m.author.id, this.userId, this.request));
        });

        return messages;
    }
}

export class Chat extends BaseChat {
    id: number;
    name: string;
    type: number;
    participants: UserQuery[];
    last_message: MessageQuery | null;
    image: string;
    is_read_only: boolean;

    constructor(
        model: ChatModel,
        userId: string,
        request: RequestFunc
    ) {
        super({
            id: model.id,
            type: model.type,
            userId: userId
        }, request);
        this.id = model.id;
        this.name = model.name;
        this.type = model.type;
        let participants: UserQuery[] = [];
        model.participants.forEach((p) => {
            participants.push(new UserQuery(p, p.id == userId, true, request));
        });
        this.participants = participants;
        this.last_message = model.last_message ? new MessageQuery(model.last_message, model.last_message.author.id == userId, request) : null;
        this.image = model.image;
        this.is_read_only = model.is_read_only;
    }
}

export class ChatQuery extends BaseChat {
    id: number;
    name: string;
    type: number;
    last_message: MessageQuery | null;
    image: string;
    is_read_only: boolean;

    constructor(
        model: ChatQueryModel,
        userId: string,
        request: RequestFunc
    ) {
        super({
            id: model.id,
            type: model.type,
            userId: userId
        }, request);
        this.id = model.id;
        this.name = model.name;
        this.type = model.type;
        this.last_message = model.last_message ? new MessageQuery(model.last_message, model.last_message.author.id == userId, request) : null;
        this.image = model.image;
        this.is_read_only = model.is_read_only;
    }

    public async getFull() {
        const res = await this.request<ChatModel>({
            url: `chats/${this.id}`
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);

        return new Chat(res.data, this.userId, this.request);
    }
}