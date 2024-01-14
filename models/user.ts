import { PostQuery } from './post';
import { Badge } from './badge';

export class User {
	name: string
	id: string
	description: string
	posts: PostQuery[]
	posts_count: number
	badges: Badge[]
	followed: boolean
	followers_count: number
	following_count: number
	created_at: string
	first_login: boolean
	coins: number
	links: string[]

	constructor(
		model: {
			name: string,
			id: string,
			description: string,
			posts: PostQuery[],
			posts_count: number,
			badges: Badge[],
			followed: boolean,
			followers_count: number,
			following_count: number,
			created_at: string,
			first_login: boolean,
			coins: number,
			links: string[]
		},
		private accessToken: string | null
	) {
		this.name = model.name;
		this.id = model.id;
		this.description = model.description;
		let posts: PostQuery[] = [];
		model.posts.forEach((p) => {
			posts.push(new PostQuery(p, accessToken));
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

	async createPost() {
		if (this.accessToken == null) {
			console.log("Unauthorized");
			return;
		}
	}
}
