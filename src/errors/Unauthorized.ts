export class UnauthorizedError extends Error {
    constructor() {
        super("Unauthorized");

        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}