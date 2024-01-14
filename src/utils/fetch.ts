import axios from 'axios';

const url = "https://api.jusfuny.com";

export async function request(path: string, accessToken: string, requestNewToken: () => string, isFirstTime: boolean = true): Promise<any | null> {
	try {
		const res = await axios.get(`${url}/${path}`);
		if (res.status == 401 && isFirstTime) {
			return request(path, requestNewToken(), requestNewToken, false);
		}
		return res.data;
	} catch(e) {
		console.log("A strange error occurred");
		return null;
	}
}
