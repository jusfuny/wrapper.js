import axios from 'axios';

const url = "https://api.jusfuny.com";

export async function request(path: string, accessToken: string): Promise<any | null> {
	try {
		const res = await axios.get(`${url}/${path}`);
		return res.data;
	} catch(e) {
		console.log("A strange error occurred");
		return null;
	}
}
