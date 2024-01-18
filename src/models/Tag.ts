import {TagModel} from "../types/Tag";
import {RequestFunc} from "../client";
import {PostQuery} from "./Post";
import {UnexpectedStatusError} from "../errors/UnexpectedStatus";

export class Tag {
    name: string;
    id: number;

    constructor(model: TagModel, private userId: string | null, private request: RequestFunc) {
        this.name = model.name;
        this.id = model.id;
    }

    public async getPosts(): Promise<PostQuery[]> {
        const res = await this.request<PostQuery[]>({
            url: `posts/tag/${this.id}`
        });

        if (res.status != 200)
            throw new UnexpectedStatusError(res);

        let posts: PostQuery[] = [];
        res.data.forEach((p) => {
            posts.push(new PostQuery(p, this.userId == p.author_id, this.userId != null, this.request));
        });
        return posts;
    }
}