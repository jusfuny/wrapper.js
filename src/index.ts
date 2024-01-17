import { Client } from './client';
import fs from 'node:fs';
import {Message} from "./models/Message";

const client = new Client();

async function doShit() {
	await client.login("takanenstudios@gmail.com", "tyger375");
	const me = await client.me();
	const feed = await me.feed();
	const post = feed.find((p) => { return p.comments_count > 0});

	await client.startWs();

	client.realtime.on("messageCreate", async (message: Message) => {
		if (message.author.id == me.id) return;
		const m = await message.chat.getMessages(0, 5);
		console.log(m);
	});
	//await me.posts[0].react("🤖");

	/*const b = fs.readFileSync("filepath");
	console.log(b.toString("base64"));
	console.log(await me.createPost({title: "Hate it when it happens", factChecker: false}, b));*/
}
doShit().then();
