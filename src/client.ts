// noinspection JSUnusedGlobalSymbols

import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import { createClient, Session } from '@supabase/supabase-js';
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/main/lib/SupabaseAuthClient";
import {User, UserQuery} from "./models/User";
import {UserModel} from "./types/User";
import {RealtimeClient} from "./realtime";
import {LoginRequiredError} from "./errors/LoginRequired";
import {UnexpectedStatusError} from "./errors/UnexpectedStatus";
import {Tag} from "./models/Tag";
import {TagModel} from "./types/Tag";

const supabaseURL = "https://bqgvutbsxbixftugczbf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ3Z1dGJzeGJpeGZ0dWdjemJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY4NjI5NDEsImV4cCI6MjAxMjQzODk0MX0.GPxEW6nA5R3dd-D-Hw7eTW1aNe59i0GDa_UrXP9_AqQ";
const url = "https://api.jusfuny.com";

function initSupabase() {
	const supabase = createClient(supabaseURL, supabaseKey);
	return supabase.auth;
}

export type RequestFunc = <T>(config: AxiosRequestConfig, isFirst?: boolean) => Promise<AxiosResponse<T>>

export class Client {
	supaClient: SupabaseAuthClient;
	realtime: RealtimeClient;
	userUid: string | null;
	accessToken: string | null;

	constructor() {
		this.supaClient = initSupabase();
		this.accessToken = null;
		this.userUid = null;
		this.realtime = new RealtimeClient(this.getToken.bind(this), this.request.bind(this));
	}

	private async getToken(): Promise<string> {
		const s = await this.getSession();
		return s.access_token;
	}

	private async request<T>(config: AxiosRequestConfig, isFirst: boolean = true): Promise<AxiosResponse<T>> {
		if (!config.headers)
			config.headers = {
				"Authorization": this.accessToken
			}
		else
			config.headers.Authorization = this.accessToken;

		config.validateStatus = () => true;
		config.url = `${url}/${config.url}`;

		const res = await axios<T>(
			config
		);

		if (res.status == 401 && isFirst) {
			const session = await this.getSession();
			this.accessToken = session.access_token;
			return this.request(config, false);
		}
		return res;
	}

	async startRealtime() {
		if (this.userUid == null)
			throw new LoginRequiredError();
		await this.realtime.start(this.userUid);
	}

	async me(): Promise<User> {
		if (!this.accessToken) {
			throw new Error("You didn't provide a token");
		}
		const res = await this.request<UserModel>({
			url: `users/${this.userUid}`
		});
		if (!res.data)
			throw new Error("Unknown error");
		return new User(res.data, true, true, this.request.bind(this));
	}

	private async getSession(): Promise<Session> {
		const { data, error } = await this.supaClient.getSession();
		if (error || !data.session) {
			throw new Error(`Failed to get session: ${error}`);
		}

		return data.session;
	}

	async login(email: string, password: string) {
		const { data, error } = await this.supaClient.signInWithPassword({
			email: email,
			password: password
		});

		if (error != null) {
			throw error;
		}

		const session = data.session;
		this.accessToken = session.access_token;
		this.userUid = session.user.id;
	}

	async getUser(userId: string) {
		const res = await this.request<UserModel>({
			url: `users/${userId}`,
			method: "get"
		});
		if (!res.data)
			throw new Error("Unknown error");
		return new User(res.data, userId == this.userUid, this.accessToken != null, this.request.bind(this));
	}

	async searchUsers({ query, matchCase = true }: { query: string, matchCase?: boolean }): Promise<UserQuery[]> {
		const res = await this.request<UserQuery[]>({
			url: `users/search?q=${query}&matchCase=${matchCase ?? true}`
		});

		if (res.status != 200)
			throw new UnexpectedStatusError(res);

		let users: UserQuery[] = [];

		res.data.forEach((u) => {
			users.push(
				new UserQuery(
					u,
					this.userUid == u.id,
					this.accessToken != null,
					this.request.bind(this)
				)
			);
		});

		return users;
	}

	async searchTags({ query, matchCase = true }: { query: string, matchCase?: boolean }): Promise<Tag[]> {
		const res = await this.request<TagModel[]>({
			url: `posts/search?q=${query}&matchCase=${matchCase ?? true}`
		});

		if (res.status != 200)
			throw new UnexpectedStatusError(res);

		let tags: Tag[] = [];

		res.data.forEach((u) => {
			tags.push(
				new Tag(
					u,
					this.userUid,
					this.request.bind(this)
				)
			);
		});

		return tags;
	}
}
