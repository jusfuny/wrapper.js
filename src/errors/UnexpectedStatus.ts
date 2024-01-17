import {AxiosResponse} from "axios";

export class UnexpectedStatusError extends Error {
    constructor(response: AxiosResponse) {
        super(`Unexpected status: ${response.status}`);

        Object.setPrototypeOf(this, UnexpectedStatusError.prototype);
    }
}