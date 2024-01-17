export class AlreadyReportedError extends Error {
    constructor(type: string) {
        super(`You've already reported this ${type}`);

        Object.setPrototypeOf(this, AlreadyReportedError.prototype);
    }
}