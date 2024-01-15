import {RequestFunc} from "../client";
import {PostModel, PostQueryModel} from "../types/Post";
import {UserQueryModel} from "../types/User";
import {CommentModel} from "../types/Comment";
import {Reaction} from "../types/Reaction";

export class PostQuery {
	id: number
	author_id: string
	reactions_count: number
	created_at: string

	constructor(
		model: PostQueryModel,
		private request: RequestFunc
	) {
		this.id = model.id;
		this.author_id = model.author_id;
		this.reactions_count = model.reactions_count;
		this.created_at = model.created_at;
	}

	react(emoji: string) {
		console.log(this.id);
	}
}

export class Post {
	id: number;
	author: UserQueryModel;
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
		private request: RequestFunc
	) {
		this.id = model.id
		this.author = model.author
		this.title = model.title
		this.comments = model.comments
		this.comments_count = model.comments_count
		this.isFactChecker = model.isFactChecker
		this.created_at = model.created_at
		this.tags = model.tags
		this.reactions = model.reactions
		this.reactions_count = model.reactions_count
		this.reacted = model.reacted
	}

	async react(emoji: string) {
		const res = await this.request<any>({
			url: `users/${this.author.id}/posts/${this.id}/reactions`,
			method: "post",
			data: {
				"emoji": emoji
			},
			headers: {
				"Content-Type": "application/json"
			}
		});
		console.log(res.data);
	}
}