import { Client } from './client';
import { User } from './models/User';

const client = new Client();

async function doShit() {
	await client.login("edoardo.takanen@gmail.com", "password");
	const me = await client.me();
	const feed = await me.feed();

	await feed[0].react("🤖");
}
doShit();
