import { Client } from './client';
import { User } from './models/User';

const client = new Client();

async function doShit() {
	await client.login("edoardo.takanen@gmail.com", "password");
	const lory = await client.getUser("c0f4f96f-f730-4987-a6d1-d8dcb362e8e3");
}
doShit();
