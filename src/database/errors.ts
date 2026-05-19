export class TimeLabError extends Error {
    override name = 'TimeLabError';

    constructor(message: string, cause?: unknown) {
        super(message);

        if (cause !== undefined) {
            this.cause = cause;
        }
    }
}


export class StorageError extends TimeLabError {
    override name = 'StorageError';
}
