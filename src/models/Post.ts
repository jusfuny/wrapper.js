import {AxiosRequestConfig, AxiosResponse} from "axios";

export class PostQuery {
	id: number
	author_id: string
	reactions_count: number
	created_at: string

	constructor(
		model: {
			id: number,
			author_id: string,
			reactions_count: number,
			created_at: string
		},
		private request: (config: AxiosRequestConfig, isFirst: boolean) => Promise<AxiosResponse | null>
	) {
		this.id = model.id;
		this.author_id = model.author_id;
		this.reactions_count = model.reactions_count;
		this.created_at = model.created_at;
	}

	react() {
		console.log(this.id);
	}
}
