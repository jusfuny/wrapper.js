import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import { createClient, Session } from '@supabase/supabase-js';
import { SupabaseAuthClient } from "@supabase/supabase-js/dist/main/lib/SupabaseAuthClient";
import {User} from "./models/User";

const supabaseURL = "https://bqgvutbsxbixftugczbf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ3Z1dGJzeGJpeGZ0dWdjemJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY4NjI5NDEsImV4cCI6MjAxMjQzODk0MX0.GPxEW6nA5R3dd-D-Hw7eTW1aNe59i0GDa_UrXP9_AqQ";
const url = "https://api.jusfuny.com";

function initSupabase() {
	const supabase = createClient(supabaseURL, supabaseKey);
	return supabase.auth;
}

export class Client {
	supaClient: SupabaseAuthClient;
	userUid: string | null;
	accessToken: string | null;

	constructor() {
		this.supaClient = initSupabase();
		this.accessToken = null;
		this.userUid = null;
	}

	async request(config: AxiosRequestConfig, isFirst: boolean = true): Promise<AxiosResponse | null> {
		if (!config.headers)
			config.headers = {
				"Authorization": this.accessToken
			}
		else
			config.headers.Authorization = this.accessToken;

		try {
			const res = await axios.get(
				`${url}/${config.url}`,
				config
			);
			if (res.status == 401 && isFirst) {
				const session = await this.getSession();
				this.accessToken = session.access_token;
				return this.request(config, false);
			}
			return res;
		} catch(e) {
			console.log("A strange error occurred");
			return null;
		}
	}

	async getSession(): Promise<Session> {
		const { data, error } = await this.supaClient.getSession();
		if (!error || !data.session) {
			console.log("Failed to get session");
			throw new Error("Nigga");
		}

		return data.session;
	}

	async login(email: string, password: string) {
		const { data, error } = await this.supaClient.signInWithPassword({
			email: email,
			password: password
		});

		if (error != null) {
			console.log("Error");
			return;
		}

		const session = data.session;
		this.accessToken = session.access_token;
		this.userUid = session.user.id;
	}

	async getUser(userId: string) {
		const res = await this.request({
			url: `users/${userId}`,
			method: "get"
		});
		return new User(res?.data, userId == this.userUid, this.request);
	}
}
