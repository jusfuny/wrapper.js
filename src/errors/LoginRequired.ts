export class LoginRequiredError extends Error {
    constructor() {
        super("This action requires being logged in");

        Object.setPrototypeOf(this, LoginRequiredError.prototype);
    }
}