import { Client } from './client';
import {Message} from "./models/Message";

const client = new Client();

async function doShit() {
	await client.login("takanenstudios@gmail.com", "tyger375");
	const me = await client.me();

	await client.startRealtime();

	client.realtime.on("messageCreate", async (message: Message) => {
		if (message.author.id == me.id) return;
		console.log(message.content);
	});
	//await me.posts[0].react("🤖");

	/*const b = fs.readFileSync("filepath");
	console.log(b.toString("base64"));
	console.log(await me.createPost({title: "Hate it when it happens", factChecker: false}, b));*/
}
doShit().then();
