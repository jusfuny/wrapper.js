import { Client } from './client';
import { User } from './models/user';

const client = new Client();

async function doShit() {
	await client.login("edoardo.takanen@gmail.com", "password");
	const res = await client.request(`users/${client.userUid}`);
	const u = new User(res, client.accessToken!);
}
doShit();
