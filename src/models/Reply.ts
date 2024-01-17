// noinspection JSUnusedGlobalSymbols

import {ReplyModel} from "../types/Reply";
import {UserQueryModel} from "../types/User";
import {BasePost} from "./Post";
import {Comment} from "./Comment";
import {LoginRequiredError} from "../errors/LoginRequired";
import {UnexpectedStatusError} from "../errors/UnexpectedStatus";
import {UnauthorizedError} from "../errors/Unauthorized";
import {ReportType} from "../types/Report";
import {RequestFunc} from "../client";

export class Reply {
    id: number;
    author: UserQueryModel;
    data: string;
    likes_count: number;
    liked: boolean;
    created_at: string;

    baseUrl: string;

    constructor(
        model: ReplyModel,
        parentPost: BasePost,
        parentComment: Comment,
        private isAuthorized: boolean,
        private isLogged: boolean,
        private request: RequestFunc
    ) {
        this.id = model.id;
        this.author = model.author;
        this.data = model.data;
        this.likes_count = model.likes_count;
        this.liked = model.liked;
        this.created_at = model.created_at;

        this.baseUrl = `users/${parentPost.author_id}/posts/${parentPost.id}/comments/${parentComment.id}/replies/${this.id}`;
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
}