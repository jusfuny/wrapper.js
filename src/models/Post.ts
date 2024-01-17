// noinspection JSUnusedGlobalSymbols

import {RequestFunc} from "../client";
import {PostModel, PostQueryModel} from "../types/Post";
import {CommentModel} from "../types/Comment";
import {Reaction} from "../types/Reaction";
import {UserQuery} from "./User";
import {LoginRequiredError} from "../errors/LoginRequired";
import {UnauthorizedError} from "../errors/Unauthorized";
import {ReportType} from "../types/Report";
import {Comment} from "./Comment";
import {AlreadyReportedError} from "../errors/AlreadyReported";
import {UnexpectedStatusError} from "../errors/UnexpectedStatus";

export class BasePost {
	id: number;
	author_id: string;

	protected baseUrl: string;

	constructor(
		model: {
			id: number,
			author_id: string
		},
		protected isAuthorized: boolean,
		protected isLogged: boolean,
		protected request: RequestFunc
	) {
		this.id = model.id;
		this.author_id = model.author_id;

		this.baseUrl = this.baseUrl = `users/${this.author_id}/posts/${this.id}`;
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

	public async react(emoji: string) {
		if (!this.isLogged)
			throw new LoginRequiredError();

		const res = await this.request({
			url: `${this.baseUrl}/reactions`,
			method: "post",
			data: {
				"emoji": emoji
			},
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (res.status != 200)
			throw new UnexpectedStatusError(res);
	}

	public async report(type: ReportType) {
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

		if (res.status == 409)
			throw new AlreadyReportedError("post");
		else if (res.status != 200)
			throw new UnexpectedStatusError(res);
	}

	public async edit(post: {title: string | null, factChecker: boolean | null}): Promise<Post> {
		if (!this.isAuthorized)
			throw new UnauthorizedError();

		const res = await this.request<Post>({
			url: this.baseUrl,
			method: "patch",
			data: post,
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (res.status != 200)
			throw new UnexpectedStatusError(res);

		return res.data;
	}
}

export class PostQuery extends BasePost {
	id: number;
	author_id: string;
	reactions_count: number;
	created_at: string;

	constructor(
		model: PostQueryModel,
		isAuthorized: boolean,
		isLogged: boolean,
		request: RequestFunc
	) {
		super({
			id: model.id,
			author_id: model.author_id
		}, isAuthorized, isLogged, request);

		this.id = model.id;
		this.author_id = model.author_id;
		this.reactions_count = model.reactions_count;
		this.created_at = model.created_at;
	}
}

export class Post extends BasePost {
	author: UserQuery;
	title: string;
	comments: CommentModel[];
	comments_count: number;
	isFactChecker: boolean;
	created_at: string;
	tags: string[];
	reactions: Reaction[];
	reactions_count: number;
	reacted: Reaction | null;

	constructor(
		model: PostModel,
		isAuthorized: boolean,
		isLogged: boolean,
		request: RequestFunc
	) {
		super({
			id: model.id,
			author_id: model.author.id
		}, isAuthorized, isLogged, request);

		this.author = model.author
		this.title = model.title
		let comments: Comment[] = []
		model.comments.forEach((c) => {
			comments.push(new Comment(c, this, isAuthorized, isLogged, request));
		});
		this.comments = comments;
		this.comments_count = model.comments_count
		this.isFactChecker = model.isFactChecker
		this.created_at = model.created_at
		this.tags = model.tags
		this.reactions = model.reactions
		this.reactions_count = model.reactions_count
		this.reacted = model.reacted
	}

	public async getComments(index: number, count: number) {
		const res = await this.request<CommentModel[]>({
			url: `${this.baseUrl}/comments?i=${index}&count=${count}`
		});

		let comments: Comment[] = [];

		res.data.forEach((c) => {
			comments.push(new Comment(c, this, this.isAuthorized, this.isLogged, this.request));
		});

		if (res.status != 200)
			throw new UnexpectedStatusError(res);

		return comments;
	}
}