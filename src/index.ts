import { Client } from './client';
import fs from 'node:fs';

const client = new Client();

async function doShit() {
	await client.login("edoardo.takanen@gmail.com", "password");
	const me = await client.me();
	//const feed = await me.feed();

	/*const b = fs.readFileSync("filepath");
	console.log(b.toString("base64"));
	console.log(await me.createPost({title: "Hate it when it happens", factChecker: false}, b));*/
}
doShit().then();
