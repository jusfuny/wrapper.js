import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabaseURL = "https://bqgvutbsxbixftugczbf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxZ3Z1dGJzeGJpeGZ0dWdjemJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTY4NjI5NDEsImV4cCI6MjAxMjQzODk0MX0.GPxEW6nA5R3dd-D-Hw7eTW1aNe59i0GDa_UrXP9_AqQ";
const url = "https://api.jusfuny.com";

function initSupabase() {
	const supabase = createClient(supabaseURL, supabaseKey);
	return supabase.auth;
}

export class Client {
	supaClient: any
	userUid: string | null
	accessToken: string | null

	async request(path: string) {
		try {
			const res = await axios.get(`${url}/${path}`);
			//console.log(res.data);
			return res.data;
		}
		catch(e) {
			console.log("A strange error occurred");
		}
	}

	constructor() {
		this.supaClient = initSupabase();
		this.accessToken = null;
		this.userUid = null;
	}

	async getSession(): Promise<any | null> {
		const { data, error } = await this.supaClient.getSession();
		if (error != null) {
			console.log("Failed to get session");
			return error;
		}

		return data;
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
}
