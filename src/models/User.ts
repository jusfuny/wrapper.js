import {Post, PostQuery} from './Post';
import { Badge } from '../types/Badge';
import {RequestFunc} from "../client";
import {UserModel} from "../types/User";
import {PostModel, PostQueryModel} from "../types/Post";

export class User {
	name: string;
	id: string;
	description: string;
	posts: PostQuery[];
	posts_count: number;
	badges: Badge[];
	followed: boolean;
	followers_count: number;
	following_count: number;
	created_at: string;
	first_login: boolean;
	coins: number;
	links: string[];

	baseUrl: string;

	constructor(
		model: UserModel,
		private isAuthorized: boolean,
		private request: RequestFunc
	) {
		this.name = model.name;
		this.id = model.id;
		this.description = model.description;
		let posts: PostQuery[] = [];
		model.posts.forEach((p) => {
			posts.push(new PostQuery(p, request));
		});
		this.posts = posts;
		this.posts_count = model.posts_count;
		this.badges = model.badges;
		this.followed = model.followed;
		this.followers_count = model.followers_count;
		this.following_count = model.following_count;
		this.created_at = model.created_at;
		this.first_login = model.first_login;
		this.coins = model.coins;
		this.links = model.links;

		this.baseUrl = `users/${this.id}`;
	}

	public async createPost() {
		if (!this.isAuthorized)
			throw new Error("Unauthorized");
	}


	public async feed(): Promise<Post[]> {
		if (!this.isAuthorized)
			throw new Error("Unauthorized");

		console.log(`${this.baseUrl}/feed`);
		const res = await this.request<PostModel[]>({
			url: `${this.baseUrl}/feed`
		});

		console.log(res.data);

		if (!res.data)
			throw new Error("Unknown error");

		let posts: Post[] = []
		res.data.forEach((p) => {
			posts.push(new Post(p, this.request));
		})
		return posts;
	}

	public async follow() {
		if (this.isAuthorized)
			throw new Error("You can't follow yourself");
	}
}