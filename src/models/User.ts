import {Post, PostQuery} from './Post';
import { Badge } from '../types/Badge';
import {RequestFunc} from "../client";
import {UserModel, UserQueryModel} from "../types/User";
import {PostModel} from "../types/Post";
import {UnauthorizedError} from "../errors/Unauthorized";
import {LoginRequiredError} from "../errors/LoginRequired";

class BaseUser {
	id: string;

	baseUrl: string;

	constructor(
		model: {
			id: string
		},
		private isAuthorized: boolean,
		private isLogged: boolean,
		private request: RequestFunc
	) {
		this.id = model.id;

		this.baseUrl = `users/${this.id}`;
	}

	public async delete() {
		if (!this.isAuthorized)
			throw new UnauthorizedError();

		await this.request({
			url: `${this.baseUrl}`,
			method: "delete"
		})
	}

	public async createPost(post: {title: string, factChecker: boolean}, buffer: Buffer): Promise<Post> {
		if (!this.isAuthorized)
			throw new UnauthorizedError();

		const data = {
			title: post.title,
			factChecker: post.factChecker,
			data: buffer.toString("base64")
		}

		const res = await this.request<Post>({
			url: `${this.baseUrl}/posts`,
			method: "post",
			data: data,
			headers: {
				"Content-Type": "application/json"
			}
		});

		return res.data;
	}

	public async edit(user: {name: string | null, description: string | null, links: string[] | null}) {
		if (!this.isAuthorized)
			throw new UnauthorizedError();

		const res = await this.request<User>({
			url: this.baseUrl,
			method: "patch",
			data: user,
			headers: {
				"Content-Type": "application/json"
			}
		})
		return res.data;
	}

	public async changePfp(blob: Blob) {
		if (!this.isAuthorized)
			throw new UnauthorizedError();

		let data = new FormData();
		data.append("file", blob, "pfp.png");

		const res = await this.request<string>({
			url: `${this.baseUrl}/picture`,
			method: "patch",
			headers: {
				"Content-Type": "multipart/form-data; boundary=File"
			},
			data: data
		});

		if (res.status == 415)
			throw new Error(res.data);
	}


	public async feed(): Promise<Post[]> {
		if (!this.isAuthorized)
			throw new UnauthorizedError();

		console.log(`${this.baseUrl}/feed`);
		const res = await this.request<PostModel[]>({
			url: `${this.baseUrl}/feed`
		});

		console.log(res.data);

		if (!res.data)
			throw new Error("Unknown error");

		let posts: Post[] = []
		res.data.forEach((p) => {
			posts.push(
				new Post(
					p,
					this.isAuthorized,
					this.isLogged,
					this.request
				)
			);
		})
		return posts;
	}

	public async follow() {
		if (this.isAuthorized)
			throw new Error("You can't follow yourself");
		if (!this.isLogged)
			throw new LoginRequiredError();

		await this.request({
			url: `${this.baseUrl}/follow`,
			method: "post"
		});
	}
}

export class UserQuery extends BaseUser {
	id: string;
	badges: Badge[];
	name: string;

	constructor(
		model: UserQueryModel,
		isAuthorized: boolean,
		isLogged: boolean,
		request: RequestFunc
	) {
		super({id: model.id}, isAuthorized, isLogged, request);

		this.id = model.id;
		this.badges = model.badges;
		this.name = model.name;
	}
}

export class User extends BaseUser {
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

	constructor(
		model: UserModel,
		isAuthorized: boolean,
		isLogged: boolean,
		request: RequestFunc
	) {
		super(
			{
				id: model.id
			},
			isAuthorized,
			isLogged,
			request
		)
		this.name = model.name;
		this.id = model.id;
		this.description = model.description;
		let posts: PostQuery[] = [];
		model.posts.forEach((p) => {
			posts.push(new PostQuery(p, isAuthorized, isLogged, request));
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
	}
}