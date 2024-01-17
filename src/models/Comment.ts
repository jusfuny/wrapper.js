// noinspection JSUnusedGlobalSymbols

import {CommentModel} from "../types/Comment";
import {ReplyModel} from "../types/Reply";
import {BasePost} from "./Post";
import {UserQuery} from "./User";
import {RequestFunc} from "../client";
import {UnauthorizedError} from "../errors/Unauthorized";
import {LoginRequiredError} from "../errors/LoginRequired";
import {UnexpectedStatusError} from "../errors/UnexpectedStatus";
import {ReportType} from "../types/Report";
import {Reply} from "./Reply";

export class Comment {
    id: number;
    likes_count: number;
    liked: boolean;
    replies_count: number;
    replies: ReplyModel[];
    created_at: string;
    author: UserQuery;
    data: string;

    baseUrl: string;

    constructor(
        model: CommentModel,
        private parent: BasePost,
        private isAuthorized: boolean,
        private isLogged: boolean,
        private request: RequestFunc
    ) {
        this.id = model.id;
        this.likes_count = model.likes_count;
        this.liked = model.liked;
        this.replies_count = model.replies_count;
        this.replies = model.replies;
        this.created_at = model.created_at;
        this.author = model.author;
        this.data = model.data;

        this.baseUrl = `users/${parent.author_id}/posts/${parent.id}/comments/${this.id}`;
    }

    public async reply(msg: string) {
        if (!this.isLogged)
            throw new LoginRequiredError();

        const res = await this.request<Reply>({
            url: `${this.baseUrl}/replies`,
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            data: {
                "data": msg
            }
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);

        return res.data;
    }

    public async delete() {
        if (!this.isAuthorized)
            throw new UnauthorizedError();

        const res = await this.request({
            url: `${this.baseUrl}`,
            method: "delete"
        });
        if (res.status != 200)
            throw new UnexpectedStatusError(res);
    }

    public async like() {
        if (!this.isLogged)
            throw new LoginRequiredError();

        const res = await this.request({
            url: `${this.baseUrl}/likes`,
            method: "post"
        });
        if (res.status != 200)
            throw new UnexpectedStatusError(res);
    }

    public async report(
        type: ReportType
    ) {
        if (!this.isLogged)
            throw new LoginRequiredError();

        const res = await this.request({
            url: `${this.baseUrl}/reports`,
            method: "post",
            data: {
                type: type.valueOf()
            },
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);
    }

    public async getReplies(index: number, count: number): Promise<Reply[]> {
        const res = await this.request<ReplyModel[]>({
            url: `${this.baseUrl}/reports?i=${index}&count=${count}`
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);

        const replies: Reply[] = [];

        res.data.forEach((r) => {
            replies.push(new Reply(r, this.parent, this, this.isAuthorized, this.isLogged, this.request));
        });

        return replies;
    }
}